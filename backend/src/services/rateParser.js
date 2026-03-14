/**
 * WhatsApp Metal Rate Message Parser
 * Handles the exact format used in Indian scrap metal trading groups
 */

// Strip bold unicode characters and emojis from text for parsing
function cleanText(text) {
  // Remove bold unicode markers (𝗔-𝗭 etc.)
  let cleaned = text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, (char) => {
    const cp = char.codePointAt(0);
    // Convert bold mathematical chars back to ASCII
    if (cp >= 0x1D400 && cp <= 0x1D7FF) {
      if (cp >= 0x1D400 && cp <= 0x1D419) return String.fromCharCode(cp - 0x1D400 + 65);
      if (cp >= 0x1D41A && cp <= 0x1D433) return String.fromCharCode(cp - 0x1D41A + 97);
      if (cp >= 0x1D7CE && cp <= 0x1D7D7) return String.fromCharCode(cp - 0x1D7CE + 48);
    }
    return '';
  });
  return cleaned.trim();
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

// Parse LME section
function parseLMESection(lines) {
  const rates = [];
  for (const line of lines) {
    const clean = cleanText(line).replace(/[*_~]/g, '').trim();
    if (!clean.includes(':')) continue;

    const colonIdx = clean.indexOf(':');
    const metalName = clean.slice(0, colonIdx).trim();
    const rest = clean.slice(colonIdx + 1).trim();

    // Match: price (change) e.g. "13141.5 (−69)" or "87.15 (+0.21)"
    const priceMatch = rest.match(/^([\d,]+(?:\.\d+)?)\s*\(([+-−][\d.]+)\)/);
    if (priceMatch) {
      const changeStr = priceMatch[2].replace('−', '-').replace('–', '-');
      rates.push({
        metal: metalName,
        price: parseFloat(priceMatch[1].replace(',', '')),
        change: parseFloat(changeStr),
        unit: '$/MT',
      });
    }
  }
  return rates;
}

// Parse MCX section
function parseMCXSection(lines) {
  const rates = [];
  for (const line of lines) {
    const clean = cleanText(line).replace(/[*_~]/g, '').trim();
    if (!clean.includes(':')) continue;

    const colonIdx = clean.indexOf(':');
    const metalName = clean.slice(0, colonIdx).trim();
    const rest = clean.slice(colonIdx + 1).trim();

    const priceMatch = rest.match(/^([\d,]+(?:\.\d+)?)\s*\(([+-−][\d.]+)\)/);
    if (priceMatch) {
      const changeStr = priceMatch[2].replace('−', '-').replace('–', '-');
      rates.push({
        metal: metalName,
        price: parseFloat(priceMatch[1].replace(',', '')),
        change: parseFloat(changeStr),
        unit: '₹/Kg',
      });
    }
  }
  return rates;
}

// Parse Forex section
function parseForexSection(lines) {
  const rates = [];
  for (const line of lines) {
    const clean = cleanText(line).replace(/[*_~]/g, '').trim();
    if (!clean.includes(':')) continue;

    const colonIdx = clean.indexOf(':');
    const pair = clean.slice(0, colonIdx).trim();
    const rest = clean.slice(colonIdx + 1).trim();

    // Match: value (change)
    const priceMatch = rest.match(/^([\d,]+(?:\.\d+)?)\s*\(([+-−][\d.]+)\)/);
    if (priceMatch) {
      const changeStr = priceMatch[2].replace('−', '-').replace('–', '-');
      rates.push({
        pair,
        price: parseFloat(priceMatch[1].replace(',', '')),
        change: parseFloat(changeStr),
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

  const result = {
    cityHub: detectCityHub(lines),
    metals: [],
    lme: [],
    mcx: [],
    forex: [],
    indices: [],
    unparsedLines: [],
    parsedAt: new Date().toISOString(),
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

  return result;
}

module.exports = { parseRateMessage };
