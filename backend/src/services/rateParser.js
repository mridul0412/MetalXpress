/**
 * WhatsApp Metal Rate Message Parser
 * Handles the exact format used in Indian scrap metal trading groups
 */

// Strip bold unicode characters and emojis from text for parsing.
// WhatsApp uses several Mathematical Unicode ranges for bold/sans-serif bold text.
function cleanText(text) {
  let cleaned = text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, (char) => {
    const cp = char.codePointAt(0);

    // ── Letters ──────────────────────────────────────────────────────────────
    // Mathematical Bold Serif A-Z (𝐀-𝐙)
    if (cp >= 0x1D400 && cp <= 0x1D419) return String.fromCharCode(cp - 0x1D400 + 65);
    // Mathematical Bold Serif a-z (𝐚-𝐳)
    if (cp >= 0x1D41A && cp <= 0x1D433) return String.fromCharCode(cp - 0x1D41A + 97);
    // Mathematical Bold Italic A-Z (𝑨-𝒁)
    if (cp >= 0x1D468 && cp <= 0x1D481) return String.fromCharCode(cp - 0x1D468 + 65);
    // Mathematical Bold Italic a-z (𝒂-𝒛)
    if (cp >= 0x1D482 && cp <= 0x1D49B) return String.fromCharCode(cp - 0x1D482 + 97);
    // Mathematical Sans-Serif Bold A-Z (𝗔-𝗭) — used by WhatsApp bold
    if (cp >= 0x1D5D4 && cp <= 0x1D5ED) return String.fromCharCode(cp - 0x1D5D4 + 65);
    // Mathematical Sans-Serif Bold a-z (𝗮-𝘇)
    if (cp >= 0x1D5EE && cp <= 0x1D607) return String.fromCharCode(cp - 0x1D5EE + 97);
    // Mathematical Sans-Serif Bold Italic A-Z
    if (cp >= 0x1D63C && cp <= 0x1D655) return String.fromCharCode(cp - 0x1D63C + 65);
    // Mathematical Sans-Serif Bold Italic a-z
    if (cp >= 0x1D656 && cp <= 0x1D66F) return String.fromCharCode(cp - 0x1D656 + 97);

    // ── Digits ───────────────────────────────────────────────────────────────
    // Mathematical Bold Digits 0-9 (𝟎-𝟗) serif
    if (cp >= 0x1D7CE && cp <= 0x1D7D7) return String.fromCharCode(cp - 0x1D7CE + 48);
    // Mathematical Double-Struck Digits 0-9
    if (cp >= 0x1D7D8 && cp <= 0x1D7E1) return String.fromCharCode(cp - 0x1D7D8 + 48);
    // Mathematical Sans-Serif Digits 0-9
    if (cp >= 0x1D7E2 && cp <= 0x1D7EB) return String.fromCharCode(cp - 0x1D7E2 + 48);
    // Mathematical Sans-Serif Bold Digits 0-9 (𝟬-𝟵) — used by WhatsApp numbers
    if (cp >= 0x1D7EC && cp <= 0x1D7F5) return String.fromCharCode(cp - 0x1D7EC + 48);
    // Mathematical Monospace Digits 0-9
    if (cp >= 0x1D7F6 && cp <= 0x1D7FF) return String.fromCharCode(cp - 0x1D7F6 + 48);

    // Everything else (emoji, decorative) → strip
    return '';
  });
  return cleaned.trim();
}

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Extract the timestamp from the message (e.g. "𝟮𝟬-𝟬𝟯-𝟮𝟲 ⏰ 𝟬𝟭:𝟰𝟱:𝟯𝟰 𝗣𝗠")
// The ⏰ clock emoji is a non-surrogate BMP char (U+23F0) that survives cleanText —
// so we use [^\d]+ between date and time (matches any non-digit, including emoji).
// Returns { display: "20 Mar, 01:45 PM", iso: "2026-03-20T08:15:34.000Z" } or null.
function extractMessageTimestamp(lines) {
  for (const line of lines.slice(0, 8)) {
    const clean = cleanText(line).trim();
    // Allow any non-digit chars between date and time (handles space, ⏰, 'T', etc.)
    const m = clean.match(
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})[^\d]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i
    );
    if (m) {
      const [, day, month, year, hours, minutes, seconds, ampm] = m;
      const fullYear = year.length === 2 ? `20${year}` : year;

      // ── Display string (exact message time, no timezone math) ──────────────
      const monthName = MONTHS_SHORT[parseInt(month, 10) - 1] || month;
      const display = `${parseInt(day, 10)} ${monthName}, ${hours.padStart(2, '0')}:${minutes}${ampm ? ' ' + ampm.toUpperCase() : ''}`;

      // ── ISO for DB: treat message time as IST (UTC+5:30), store as UTC ─────
      let h = parseInt(hours, 10);
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
        if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
      }
      // Date.UTC gives ms in UTC; subtract IST offset (5h 30m) to convert IST→UTC
      const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
      const istMs = Date.UTC(
        parseInt(fullYear, 10), parseInt(month, 10) - 1, parseInt(day, 10),
        h, parseInt(minutes, 10), parseInt(seconds || '0', 10)
      );
      const iso = new Date(istMs - IST_OFFSET_MS).toISOString();

      return { display, iso };
    }
  }
  return null;
}

// Determine the message type from parsed result
// Returns: 'lme-mcx' | 'local-rates' | 'mixed' | 'unknown'
function detectMessageType(result) {
  const localGrades = result.metals?.reduce((s, m) => s + (m.rates?.length || 0), 0) || 0;
  const hasLME    = (result.lme?.length || 0) >= 2;
  const hasMCX    = (result.mcx?.length || 0) >= 2;
  const hasForex  = (result.forex?.length || 0) >= 1;
  const hasLocal  = localGrades > 0;

  if (hasLocal && !hasLME && !hasMCX) return 'local-rates';
  if ((hasLME || hasMCX || hasForex) && !hasLocal) return 'lme-mcx';
  if (hasLocal && (hasLME || hasMCX)) return 'mixed';
  return 'unknown';
}

// Detect city and hub from header line
function detectCityHub(lines) {
  for (const line of lines.slice(0, 5)) {
    const clean = cleanText(line).toUpperCase();
    // Pattern: DELHI SPOT RATE (MANDOLI) or MUMBAI RATE (DHARAVI)
    const match = clean.match(/([A-Z\s]+?)\s+(?:SPOT\s+)?RATE(?:\s+[A-Z\s]+)?\s*\(([^)]+)\)/i);
    if (match) {
      return {
        city: match[1].trim(),
        hub: match[2].trim(),
      };
    }
    // Try simpler: CITY (HUB)
    const simpleMatch = clean.match(/^([A-Z\s]+)\s*\(([^)]+)\)/i);
    if (simpleMatch) {
      return {
        city: simpleMatch[1].trim(),
        hub: simpleMatch[2].trim(),
      };
    }
  }
  return { city: 'UNKNOWN', hub: 'UNKNOWN' };
}

// Map metal section headers to metal names
const METAL_HEADERS = {
  'COPPER': 'Copper',
  'BRASS': 'Brass',
  'ALUMINIUM': 'Aluminium',
  'ALUMINUM': 'Aluminium',
  'LEAD': 'Lead',
  'ZINC': 'Zinc',
  'OTHER METALS': 'Other',
  'OTHER': 'Other',
  'M.S.': 'MS',
  'MS': 'MS',
  'STEEL': 'MS',
  'TIN': 'Other',
  'NICKEL': 'Other',
};

// Detect if a line is a metal section header
function detectMetalHeader(line) {
  const clean = cleanText(line).toUpperCase();
  // Remove emojis at start
  const stripped = clean.replace(/^[\s\u{1F000}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}⚡⚫🔵🥇🥈🟡🏗️🏙️•▪▸▷]+/u, '').trim();

  for (const [key, val] of Object.entries(METAL_HEADERS)) {
    if (stripped.startsWith(key) || stripped === key) {
      return val;
    }
  }
  return null;
}

// Parse a single grade rate line
// Formats:
//   "Armature Bhatti: 1140 + / 1230"
//   "Super D: 1280 (1.6MM: 1294)"
//   "Rod: 358+"
//   "Gun Metal Local: 817 / 827 / 847"
function parseGradeLine(line) {
  const clean = cleanText(line).replace(/[*_~]/g, '').trim();

  // Must have a colon to be a grade line
  if (!clean.includes(':')) return null;

  const colonIdx = clean.indexOf(':');
  const gradeName = clean.slice(0, colonIdx).trim();
  let pricesPart = clean.slice(colonIdx + 1).trim();

  if (!gradeName || !pricesPart) return null;

  // Skip lines that look like section headers (all caps, no numbers)
  if (/^[A-Z\s.()]+$/.test(gradeName) && !/\d/.test(pricesPart)) return null;

  // Extract variant price in parentheses e.g. (1.6MM: 1294)
  let variantPrice = null;
  let variantLabel = null;
  const variantMatch = pricesPart.match(/\(([^)]+):\s*(\d+(?:\.\d+)?)\s*\)/);
  if (variantMatch) {
    variantLabel = variantMatch[1].trim();
    variantPrice = parseFloat(variantMatch[2]);
    pricesPart = pricesPart.replace(variantMatch[0], '').trim();
  }

  // Remove trailing/leading + signs (just indicators, not math)
  pricesPart = pricesPart.replace(/\+\s*$/, '').trim();

  // Extract numbers
  const numParts = pricesPart.match(/\d+(?:\.\d+)?/g);
  if (!numParts || numParts.length === 0) return null;

  // Remove LME/MCX-style change indicators in parens like (+12) or (-3)
  const changeMatch = pricesPart.match(/\([+-]\d+(?:\.\d+)?\)/);
  let change = null;
  if (changeMatch) {
    change = parseFloat(changeMatch[0].replace(/[()]/g, ''));
    pricesPart = pricesPart.replace(changeMatch[0], '').trim();
  }

  // Check for buy/sell pattern: "1140 + / 1230" or "1140 / 1230"
  const buySellMatch = pricesPart.match(/^(\d+(?:\.\d+)?)\s*\+?\s*\/\s*(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+(?:\.\d+)?))?/);
  if (buySellMatch) {
    return {
      gradeName,
      buyPrice: parseFloat(buySellMatch[1]),
      sellPrice: parseFloat(buySellMatch[2]),
      variantPrice,
      variantLabel,
      change,
      raw: clean,
      confidence: 0.95,
    };
  }

  // Single price: "358+" or "358"
  const singleMatch = pricesPart.match(/^(\d+(?:\.\d+)?)\s*\+?/);
  if (singleMatch) {
    return {
      gradeName,
      buyPrice: parseFloat(singleMatch[1]),
      sellPrice: null,
      variantPrice,
      variantLabel,
      change,
      raw: clean,
      confidence: 0.85,
    };
  }

  return null;
}

// Parse LME section — handles "price (change)" and plain "price" formats
function parseLMESection(lines) {
  const rates = [];
  for (const line of lines) {
    const clean = cleanText(line).replace(/[*_~]/g, '').trim();
    if (!clean.includes(':')) continue;

    const colonIdx = clean.indexOf(':');
    const metalName = clean.slice(0, colonIdx).trim();
    const rest = clean.slice(colonIdx + 1).trim();

    // Try with change: "12205 (−100.12)"
    const withChange = rest.match(/^([\d,]+(?:\.\d+)?)\s*\(([+-−][\d.]+)\)/);
    if (withChange) {
      const changeStr = withChange[2].replace('−', '-').replace('–', '-');
      rates.push({
        metal: metalName,
        price: parseFloat(withChange[1].replace(',', '')),
        change: parseFloat(changeStr),
        unit: '$/MT',
      });
      continue;
    }

    // Try plain price: "94.56" (e.g. Crude without change)
    const plainPrice = rest.match(/^([\d,]+(?:\.\d+)?)/);
    if (plainPrice) {
      rates.push({
        metal: metalName,
        price: parseFloat(plainPrice[1].replace(',', '')),
        change: 0,
        unit: '$/MT',
      });
    }
  }
  return rates;
}

// Parse MCX section — handles both "price (change)" and plain "price" formats
function parseMCXSection(lines) {
  const rates = [];
  for (const line of lines) {
    const clean = cleanText(line).replace(/[*_~]/g, '').trim();
    if (!clean.includes(':')) continue;

    const colonIdx = clean.indexOf(':');
    const metalName = clean.slice(0, colonIdx).trim();
    const rest = clean.slice(colonIdx + 1).trim();

    // Try with change: "1115.35 (+12.5)" or "1115.35 (−12.5)"
    const withChange = rest.match(/^([\d,]+(?:\.\d+)?)\s*\(([+-−][\d.]+)\)/);
    if (withChange) {
      const changeStr = withChange[2].replace('−', '-').replace('–', '-');
      rates.push({
        metal: metalName,
        price: parseFloat(withChange[1].replace(',', '')),
        change: parseFloat(changeStr),
        unit: '₹/Kg',
      });
      continue;
    }

    // Try plain price: "1115.35"
    const plainPrice = rest.match(/^([\d,]+(?:\.\d+)?)/);
    if (plainPrice) {
      rates.push({
        metal: metalName,
        price: parseFloat(plainPrice[1].replace(',', '')),
        change: 0,
        unit: '₹/Kg',
      });
    }
  }
  return rates;
}

// Parse Forex section — handles both "value (change)" and plain "value" formats
function parseForexSection(lines) {
  const rates = [];
  for (const line of lines) {
    const clean = cleanText(line).replace(/[*_~]/g, '').trim();
    if (!clean.includes(':')) continue;

    const colonIdx = clean.indexOf(':');
    const pair = clean.slice(0, colonIdx).trim();
    const rest = clean.slice(colonIdx + 1).trim();

    // Try with change: "93.32 (−0.10)"
    const withChange = rest.match(/^([\d,]+(?:\.\d+)?)\s*\(([+-−][\d.]+)\)/);
    if (withChange) {
      const changeStr = withChange[2].replace('−', '-').replace('–', '-');
      rates.push({
        pair,
        price: parseFloat(withChange[1].replace(',', '')),
        change: parseFloat(changeStr),
      });
      continue;
    }

    // Try plain value: "93.3225"
    const plainPrice = rest.match(/^([\d,]+(?:\.\d+)?)/);
    if (plainPrice) {
      rates.push({
        pair,
        price: parseFloat(plainPrice[1].replace(',', '')),
        change: 0,
      });
    }
  }
  return rates;
}

/**
 * Main parser function
 * @param {string} rawMessage - Raw WhatsApp message text
 * @returns {object} Structured parsed data
 */
function parseRateMessage(rawMessage) {
  const lines = rawMessage.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const msgTs = extractMessageTimestamp(lines);

  const result = {
    cityHub: detectCityHub(lines),
    metals: [],
    lme: [],
    mcx: [],
    forex: [],
    indices: [],
    unparsedLines: [],
    parsedAt:            msgTs?.iso     || new Date().toISOString(),
    messageTimestampStr: msgTs?.display || null,   // e.g. "20 Mar, 01:45 PM" — no timezone issues
    confidence: 0,
  };

  let currentMetal = null;
  let currentSection = null; // 'metals', 'lme', 'mcx', 'forex'
  let currentMetalRates = [];
  let lmeLines = [];
  let mcxLines = [];
  let forexLines = [];
  let totalLines = 0;
  let parsedLines = 0;

  for (const line of lines) {
    totalLines++;
    const cleanLine = cleanText(line);
    const upperLine = cleanLine.toUpperCase();

    // Section detection
    if (upperLine.includes('LME RATE') || upperLine.includes('LME:')) {
      if (currentMetal && currentMetalRates.length > 0) {
        result.metals.push({ metal: currentMetal, rates: currentMetalRates });
        currentMetalRates = [];
        currentMetal = null;
      }
      currentSection = 'lme';
      parsedLines++;
      continue;
    }

    if (upperLine.includes('MCX RATE') || upperLine.includes('MCX:')) {
      if (currentMetal && currentMetalRates.length > 0) {
        result.metals.push({ metal: currentMetal, rates: currentMetalRates });
        currentMetalRates = [];
        currentMetal = null;
      }
      currentSection = 'mcx';
      parsedLines++;
      continue;
    }

    if (upperLine.includes('FOREX') || upperLine.includes('USD/INR') || upperLine.includes('EUR/USD')) {
      if (upperLine.includes('FOREX') || upperLine.includes('INDICES')) {
        currentSection = 'forex';
        parsedLines++;
        continue;
      }
    }

    // Route to section parsers
    if (currentSection === 'lme') {
      // Check if Nifty/Sensex line (index, not LME)
      if (upperLine.includes('NIFTY') || upperLine.includes('SENSEX')) {
        const parsed = parseForexSection([line]);
        if (parsed.length > 0) {
          result.indices.push(...parsed);
          parsedLines++;
        }
        continue;
      }
      lmeLines.push(line);
      parsedLines++;
      continue;
    }

    if (currentSection === 'mcx') {
      if (upperLine.includes('USD') || upperLine.includes('EUR') || upperLine.includes('FOREX')) {
        currentSection = 'forex';
        forexLines.push(line);
        parsedLines++;
        continue;
      }
      mcxLines.push(line);
      parsedLines++;
      continue;
    }

    if (currentSection === 'forex') {
      if (upperLine.includes('NIFTY') || upperLine.includes('SENSEX')) {
        const parsed = parseForexSection([line]);
        result.indices.push(...parsed);
        parsedLines++;
        continue;
      }
      forexLines.push(line);
      parsedLines++;
      continue;
    }

    // Metal section detection
    const metalName = detectMetalHeader(line);
    if (metalName) {
      if (currentMetal && currentMetalRates.length > 0) {
        result.metals.push({ metal: currentMetal, rates: currentMetalRates });
      }
      currentMetal = metalName;
      currentMetalRates = [];
      currentSection = 'metals';
      parsedLines++;
      continue;
    }

    // Grade rate line
    if (currentSection === 'metals' && currentMetal) {
      const parsed = parseGradeLine(line);
      if (parsed) {
        currentMetalRates.push(parsed);
        parsedLines++;
      } else if (line.includes(':') && /\d/.test(line)) {
        result.unparsedLines.push({ line, reason: 'could_not_parse_grade' });
      }
      continue;
    }

    // City header or timestamp — skip gracefully
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(cleanLine) ||
        upperLine.includes('SPOT RATE') ||
        upperLine.includes('MANDI')) {
      parsedLines++;
      continue;
    }
  }

  // Flush last metal section
  if (currentMetal && currentMetalRates.length > 0) {
    result.metals.push({ metal: currentMetal, rates: currentMetalRates });
  }

  // Parse collected sections
  result.lme = parseLMESection(lmeLines);
  result.mcx = parseMCXSection(mcxLines);
  result.forex = parseForexSection(forexLines);

  result.confidence = totalLines > 0 ? Math.round((parsedLines / totalLines) * 100) : 0;
  result.messageType = detectMessageType(result);

  return result;
}

module.exports = { parseRateMessage, cleanText };
