/**
 * Live metal price fetcher — no API key required.
 * Sources: Yahoo Finance v8 chart API + Stooq CSV
 */

const YAHOO_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const STOOQ_URL = 'https://stooq.com/q/l/?f=sd2t2ohlcv&h&e=csv';
const HEADERS = { 'User-Agent': 'Mozilla/5.0' };

const YAHOO_METALS = [
  { metal: 'Copper',    symbol: 'HG=F',   toMt: 2204.62 },
  { metal: 'Aluminium', symbol: 'ALI=F',  toMt: 1       },
  { metal: 'Zinc',      symbol: 'ZNC=F',  toMt: 1       },
  { metal: 'Lead',      symbol: 'PB-USD', toMt: 2204.62 },
];

const STOOQ_METALS = [
  { metal: 'Nickel', symbol: 'NI.F', toMt: 22.0462 },
];

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
    return {
      close: parseFloat(cols[6]),
      prevClose: prevCols ? parseFloat(prevCols[6]) : null,
    };
  } catch {
    return null;
  }
}

async function fetchLivePrices() {
  const [usdInrMeta, ...yahooMetas] = await Promise.all([
    fetchYahooMeta('USDINR=X'),
    ...YAHOO_METALS.map(m => fetchYahooMeta(m.symbol)),
  ]);
  const stooqRows = await Promise.all(STOOQ_METALS.map(m => fetchStooq(m.symbol)));

  const usdInr = usdInrMeta?.price ?? 84;
  const results = [];

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
      change = parseFloat((((priceUsd - prev) / prev) * 100).toFixed(2));
    }
    results.push({ metal: m.metal, priceUsd, priceMcx, change });
  });

  STOOQ_METALS.forEach((m, i) => {
    const row = stooqRows[i];
    if (!row) return;
    const priceUsd = parseFloat((row.close * m.toMt).toFixed(2));
    const priceMcx = parseFloat(((priceUsd * usdInr) / 1000).toFixed(2));
    let change = 0;
    if (row.prevClose) {
      const prev = row.prevClose * m.toMt;
      change = parseFloat((((priceUsd - prev) / prev) * 100).toFixed(2));
    }
    results.push({ metal: m.metal, priceUsd, priceMcx, change });
  });

  return results;
}

module.exports = { fetchLivePrices };
