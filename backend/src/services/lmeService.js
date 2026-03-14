const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Metals API symbols mapping
const LME_SYMBOLS = {
  'Copper': 'XCU',
  'Aluminium': 'XAL',
  'Nickel': 'XNI',
  'Lead': 'XPB',
  'Zinc': 'XZN',
  'Tin': 'XSN',
  'Crude': 'BRENTOIL',
  'Gold': 'XAU',
  'Silver': 'XAG',
};

/**
 * Fetch LME rates from Metals-API
 * Falls back to last saved rates if API is unavailable
 */
async function fetchLMERates() {
  const apiKey = process.env.LME_API_KEY;
  const apiUrl = process.env.LME_API_URL;

  if (!apiKey || apiKey === 'placeholder-api-key') {
    console.log('[LME] No API key configured, using cached rates');
    return null;
  }

  try {
    const symbols = Object.values(LME_SYMBOLS).join(',');
    const response = await axios.get(`${apiUrl}/latest`, {
      params: {
        access_key: apiKey,
        base: 'USD',
        symbols,
      },
      timeout: 10000,
    });

    if (!response.data.success) {
      console.error('[LME] API error:', response.data.error);
      return null;
    }

    const rates = response.data.rates;
    const lmeRates = [];

    for (const [metalName, symbol] of Object.entries(LME_SYMBOLS)) {
      if (rates[symbol]) {
        // Metals-API returns per troy oz for precious metals, per MT for base metals
        const price = 1 / rates[symbol]; // Convert to $/MT approximation
        lmeRates.push({
          metal: metalName,
          price,
          change: 0, // Would need historical data for change
          unit: metalName === 'Crude' ? '$/barrel' : (metalName === 'Gold' || metalName === 'Silver' ? '$/oz' : '$/MT'),
        });
      }
    }

    // Save to DB
    for (const rate of lmeRates) {
      await prisma.lMERate.create({ data: rate });
    }

    return lmeRates;
  } catch (err) {
    console.error('[LME] Fetch failed:', err.message);
    return null;
  }
}

/**
 * Get latest LME rates from DB
 */
async function getLatestLMERates() {
  // Get the most recent rate for each metal
  const metals = Object.keys(LME_SYMBOLS);
  const rates = [];

  for (const metal of metals) {
    const rate = await prisma.lMERate.findFirst({
      where: { metal },
      orderBy: { createdAt: 'desc' },
    });
    if (rate) rates.push(rate);
  }

  return rates;
}

/**
 * Get latest MCX rates from DB
 */
async function getLatestMCXRates() {
  const metals = ['Copper', 'Aluminium', 'Nickel', 'Lead', 'Zinc', 'Crude', 'Gold', 'Silver', 'Natural Gas'];
  const rates = [];

  for (const metal of metals) {
    const rate = await prisma.mCXRate.findFirst({
      where: { metal },
      orderBy: { createdAt: 'desc' },
    });
    if (rate) rates.push(rate);
  }

  return rates;
}

/**
 * Get latest forex rates from DB
 */
async function getLatestForexRates() {
  const pairs = ['USD/INR', 'EUR/USD', 'Nifty', 'Sensex'];
  const rates = [];

  for (const pair of pairs) {
    const rate = await prisma.forexRate.findFirst({
      where: { pair },
      orderBy: { createdAt: 'desc' },
    });
    if (rate) rates.push(rate);
  }

  return rates;
}

module.exports = {
  fetchLMERates,
  getLatestLMERates,
  getLatestMCXRates,
  getLatestForexRates,
};
