/**
 * Live metal price fetcher.
 * Sources (in priority order):
 *   1. metals-api.com  — real LME spot prices (requires METALS_API_KEY in .env)
 *   2. Yahoo Finance v8 chart API — free, no key
 *   3. Stooq CSV — free, no key (for Nickel, Lead, Tin)
 *
 * Return shape:
 *   {
 *     metals:  [{ metal, priceUsd, priceMcx, change }],
 *     forex:   { usdInr, eurUsd, usdInrChange, eurUsdChange },
 *     indices: { nifty, sensex, niftyChange, sensexChange },
 *     crude:   { price, change },
 *     usdInr,          // root-level convenience alias
 *   }
 */

const YAHOO_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const STOOQ_URL = 'https://stooq.com/q/l/?f=sd2t2ohlcv&h&e=csv';
const HEADERS = { 'User-Agent': 'Mozilla/5.0' };

// Yahoo Finance metal symbols
const YAHOO_METALS = [
  { metal: 'Copper',    symbol: 'HG=F',   toMt: 2204.62 }, // USD/lb → USD/MT
  { metal: 'Aluminium', symbol: 'ALI=F',  toMt: 1       }, // USD/MT direct
  { metal: 'Zinc',      symbol: 'ZNC=F',  toMt: 1       }, // USD/MT direct
];

// Stooq metals (¢/lb → USD/MT via toMt = 22.0462)
// Note: Lead (PB.F) and Tin (SN.F) return N/D on Stooq — no free live source available.
// They are populated from the admin WhatsApp paste (LMERate table in DB) instead.
const STOOQ_METALS = [
  { metal: 'Nickel', symbol: 'NI.F', toMt: 22.0462 },
];

// metals-api.com symbols (spot price per troy oz in USD)
const METALS_API_SYMBOLS = {
  Copper:    'XCU',
  Aluminium: 'ALU',
  Nickel:    'XNI',
  Lead:      'XPB',
  Zinc:      'XZN',
  Tin:       'XSN',
};
const TROY_OZ_PER_MT = 32150.75;

// ── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchYahooMeta(symbol) {
  try {
    const url = `${YAHOO_URL}/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    return {
      price: meta.regularMarketPrice,
      changePct: meta.regularMarketChangePercent ?? null,
      prevClose: meta.chartPreviousClose ?? meta.previousClose ?? null,
    };
  } catch {
    return null;
  }
}

async function fetchStooq(symbol) {
  try {
    const url = `${STOOQ_URL}&s=${encodeURIComponent(symbol)}`;
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
    const text = await res.text();
    const lines = text.trim().split('\n').filter(l => l && !l.startsWith('Symbol'));
    if (!lines.length) return null;
    const cols = lines[0].split(',');
    const prevCols = lines[1]?.split(',');
    const close = parseFloat(cols[6]);
    const prevClose = prevCols ? parseFloat(prevCols[6]) : null;
    if (!close || isNaN(close)) return null;
    return { close, prevClose };
  } catch {
    return null;
  }
}

/** Fetch from metals-api.com — returns map of { SYMBOL: pricePerTroyOzUsd } */
async function fetchMetalsApi(apiKey) {
  try {
    const symbols = Object.values(METALS_API_SYMBOLS).join(',');
    const url = `https://metals-api.com/api/latest?access_key=${apiKey}&base=USD&symbols=${symbols}`;
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    if (!data?.success || !data?.rates) return null;
    return data.rates; // e.g. { XCU: 0.000354, ... } — price of 1 USD in troy oz of metal → invert
  } catch {
    return null;
  }
}

// ── Compute change pct from raw values ──────────────────────────────────────

function calcChange(current, prev) {
  if (!prev || prev === 0) return 0;
  return parseFloat((((current - prev) / prev) * 100).toFixed(2));
}

// ── Main fetch function ──────────────────────────────────────────────────────

async function fetchLivePrices() {
  const apiKey = process.env.METALS_API_KEY;

  // ── 1. Forex + Indices (always from Yahoo) ─────────────────────────────
  const [usdInrMeta, eurUsdMeta, niftyMeta, sensexMeta, crudeMeta] = await Promise.all([
    fetchYahooMeta('USDINR=X'),
    fetchYahooMeta('EURUSD=X'),
    fetchYahooMeta('^NSEI'),
    fetchYahooMeta('^BSESN'),
    fetchYahooMeta('CL=F'),
  ]);

  const usdInr = usdInrMeta?.price ?? 84;

  const forex = {
    usdInr: usdInrMeta?.price ?? null,
    eurUsd: eurUsdMeta?.price ?? null,
    usdInrChange: usdInrMeta?.changePct != null
      ? parseFloat(usdInrMeta.changePct.toFixed(4))
      : (usdInrMeta?.prevClose ? calcChange(usdInrMeta.price, usdInrMeta.prevClose) : 0),
    eurUsdChange: eurUsdMeta?.changePct != null
      ? parseFloat(eurUsdMeta.changePct.toFixed(4))
      : (eurUsdMeta?.prevClose ? calcChange(eurUsdMeta.price, eurUsdMeta.prevClose) : 0),
  };

  const indices = {
    nifty: niftyMeta?.price ?? null,
    sensex: sensexMeta?.price ?? null,
    niftyChange: niftyMeta?.changePct != null
      ? parseFloat(niftyMeta.changePct.toFixed(2))
      : (niftyMeta?.prevClose ? calcChange(niftyMeta.price, niftyMeta.prevClose) : 0),
    sensexChange: sensexMeta?.changePct != null
      ? parseFloat(sensexMeta.changePct.toFixed(2))
      : (sensexMeta?.prevClose ? calcChange(sensexMeta.price, sensexMeta.prevClose) : 0),
  };

  const crude = {
    price: crudeMeta?.price ?? null,
    change: crudeMeta?.changePct != null
      ? parseFloat(crudeMeta.changePct.toFixed(2))
      : (crudeMeta?.prevClose ? calcChange(crudeMeta.price, crudeMeta.prevClose) : 0),
  };

  // ── 2. Metals ──────────────────────────────────────────────────────────
  const metals = [];

  // Try metals-api.com first if key is configured
  if (apiKey && apiKey !== 'your_metals_api_key_here' && apiKey.length > 8) {
    const rates = await fetchMetalsApi(apiKey);
    if (rates) {
      for (const [metalName, symbol] of Object.entries(METALS_API_SYMBOLS)) {
        const symbolRate = rates[symbol];
        if (!symbolRate || symbolRate === 0) continue;
        // metals-api returns rate as: how many units of symbol per 1 USD
        // So price in USD per troy oz = 1 / symbolRate
        const pricePerTroyOz = 1 / symbolRate;
        const priceUsd = parseFloat((pricePerTroyOz * TROY_OZ_PER_MT).toFixed(2));
        const priceMcx = parseFloat(((priceUsd * usdInr) / 1000).toFixed(2));
        metals.push({ metal: metalName, priceUsd, priceMcx, change: 0, source: 'metals-api' });
      }
      if (metals.length >= 4) {
        return { metals, forex, indices, crude, usdInr };
      }
      // Not enough data — fall through to Yahoo/Stooq
      metals.length = 0;
    }
  }

  // Fall back to Yahoo Finance + Stooq
  const yahooMetas = await Promise.all(YAHOO_METALS.map(m => fetchYahooMeta(m.symbol)));
  const stooqRows  = await Promise.all(STOOQ_METALS.map(m => fetchStooq(m.symbol)));

  YAHOO_METALS.forEach((m, i) => {
    const meta = yahooMetas[i];
    if (!meta) return;
    const priceUsd = parseFloat((meta.price * m.toMt).toFixed(2));
    const priceMcx = parseFloat(((priceUsd * usdInr) / 1000).toFixed(2));
    let change = 0;
    if (meta.changePct != null) {
      change = parseFloat(meta.changePct.toFixed(2));
    } else if (meta.prevClose) {
      const prev = meta.prevClose * m.toMt;
      change = calcChange(priceUsd, prev);
    }
    metals.push({ metal: m.metal, priceUsd, priceMcx, change, source: 'yahoo' });
  });

  STOOQ_METALS.forEach((m, i) => {
    const row = stooqRows[i];
    if (!row || !row.close) return;
    const priceUsd = parseFloat((row.close * m.toMt).toFixed(2));
    const priceMcx = parseFloat(((priceUsd * usdInr) / 1000).toFixed(2));
    let change = 0;
    if (row.prevClose) {
      const prev = row.prevClose * m.toMt;
      change = calcChange(priceUsd, prev);
    }
    metals.push({ metal: m.metal, priceUsd, priceMcx, change, source: 'stooq' });
  });

  return { metals, forex, indices, crude, usdInr };
}

module.exports = { fetchLivePrices };
