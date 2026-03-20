require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CITIES = [
  { name: 'Delhi', slug: 'delhi', hubs: [{ name: 'Mandoli', slug: 'mandoli-delhi' }] },
  { name: 'Mumbai', slug: 'mumbai', hubs: [{ name: 'Kurla', slug: 'kurla-mumbai' }, { name: 'Dharavi', slug: 'dharavi-mumbai' }] },
  { name: 'Ahmedabad', slug: 'ahmedabad', hubs: [{ name: 'Naroda', slug: 'naroda-ahmedabad' }] },
  { name: 'Chennai', slug: 'chennai', hubs: [{ name: 'Ambattur', slug: 'ambattur-chennai' }] },
  { name: 'Kolkata', slug: 'kolkata', hubs: [{ name: 'Tangra', slug: 'tangra-kolkata' }] },
  { name: 'Ludhiana', slug: 'ludhiana', hubs: [{ name: 'Focal Point', slug: 'focal-point-ludhiana' }] },
  { name: 'Jaipur', slug: 'jaipur', hubs: [{ name: 'Sitapura', slug: 'sitapura-jaipur' }] },
  { name: 'Kanpur', slug: 'kanpur', hubs: [{ name: 'Panki', slug: 'panki-kanpur' }] },
  { name: 'Hyderabad', slug: 'hyderabad', hubs: [{ name: 'Nacharam', slug: 'nacharam-hyderabad' }] },
];

const METALS = [
  { name: 'Copper', emoji: '🥇', colorHex: '#B87333', sortOrder: 1, grades: [
    { name: 'Armature Bhatti', hasVariants: false },
    { name: 'Armature Plant', hasVariants: false },
    { name: 'Super D', hasVariants: true, variantLabel: '1.6MM' },
    { name: 'CC Rod', hasVariants: false },
    { name: 'CCR', hasVariants: true, variantLabel: '1.6MM' },
    { name: 'Kaliya', hasVariants: true, variantLabel: '1.6MM' },
  ]},
  { name: 'Brass', emoji: '🟡', colorHex: '#CFB53B', sortOrder: 2, grades: [
    { name: 'Purja', hasVariants: false },
    { name: 'Honey', hasVariants: false },
    { name: 'Chadri', hasVariants: false },
  ]},
  { name: 'Aluminium', emoji: '🥈', colorHex: '#A8C0C0', sortOrder: 3, grades: [
    { name: 'Rod', hasVariants: false },
    { name: 'Ingot', hasVariants: false },
    { name: 'Purja', hasVariants: false },
    { name: 'Bartan', hasVariants: false },
    { name: 'Wire Scrap', hasVariants: false },
  ]},
  { name: 'Lead', emoji: '⚫', colorHex: '#708090', sortOrder: 4, grades: [
    { name: 'Lead', hasVariants: false },
    { name: 'Lead Hard', hasVariants: false },
    { name: 'Battery', hasVariants: false },
  ]},
  { name: 'Zinc', emoji: '🔵', colorHex: '#4A90D9', sortOrder: 5, grades: [
    { name: 'Slab', hasVariants: false },
    { name: 'Dross', hasVariants: false },
    { name: 'PMI', hasVariants: false },
    { name: 'Kuskut', hasVariants: false },
    { name: 'Tukdi', hasVariants: false },
  ]},
  { name: 'Other', emoji: '⚡', colorHex: '#F5A623', sortOrder: 6, grades: [
    { name: 'Tin', hasVariants: false },
    { name: 'Nickel', hasVariants: false },
    { name: 'Gun Metal', hasVariants: false },
  ]},
  { name: 'MS', emoji: '🏗️', colorHex: '#888888', sortOrder: 7, grades: [
    { name: 'Mandi Scrap', hasVariants: false },
    { name: 'Mandi Ingot', hasVariants: false },
  ]},
];

// Seed rates matching the reference WhatsApp message
const DELHI_MANDOLI_RATES = {
  'Copper': {
    'Armature Bhatti': { buyPrice: 1140, sellPrice: 1230 },
    'Armature Plant': { buyPrice: 1142, sellPrice: 1232 },
    'Super D': { buyPrice: 1280, sellPrice: null, variantPrice: 1294, variantLabel: '1.6MM' },
    'CC Rod': { buyPrice: 1240, sellPrice: 1335 },
    'CCR': { buyPrice: 1223, sellPrice: 1302, variantPrice: 1312, variantLabel: '1.6MM' },
    'Kaliya': { buyPrice: 1268, sellPrice: null, variantPrice: 1282, variantLabel: '1.6MM' },
  },
  'Brass': {
    'Purja': { buyPrice: 665, sellPrice: 705 },
    'Honey': { buyPrice: 710, sellPrice: 750 },
    'Chadri': { buyPrice: 700, sellPrice: 740 },
  },
  'Aluminium': {
    'Rod': { buyPrice: 358, sellPrice: null },
    'Ingot': { buyPrice: 335, sellPrice: null },
    'Purja': { buyPrice: 231, sellPrice: null },
    'Bartan': { buyPrice: 248, sellPrice: null },
    'Wire Scrap': { buyPrice: 300, sellPrice: null },
  },
  'Lead': {
    'Lead': { buyPrice: 188, sellPrice: 209 },
    'Lead Hard': { buyPrice: 196, sellPrice: 217 },
    'Battery': { buyPrice: 112, sellPrice: 123 },
  },
  'Zinc': {
    'Slab': { buyPrice: 334, sellPrice: 352 },
    'Dross': { buyPrice: 264, sellPrice: 282 },
    'PMI': { buyPrice: 287, sellPrice: 306 },
    'Kuskut': { buyPrice: 245, sellPrice: 260 },
    'Tukdi': { buyPrice: 260, sellPrice: 280 },
  },
  'Other': {
    'Tin': { buyPrice: 4750, sellPrice: 4950 },
    'Nickel': { buyPrice: 1630, sellPrice: 1720 },
    'Gun Metal': { buyPrice: 817, sellPrice: 847 },
  },
  'MS': {
    'Mandi Scrap': { buyPrice: 32600, sellPrice: null },
    'Mandi Ingot': { buyPrice: 44600, sellPrice: null },
  },
};

const LME_RATES = [
  { metal: 'Copper', price: 13141.5, change: -69, unit: '$/MT' },
  { metal: 'Aluminium', price: 3332, change: 22, unit: '$/MT' },
  { metal: 'Nickel', price: 17505, change: -196, unit: '$/MT' },
  { metal: 'Lead', price: 1937.5, change: -46, unit: '$/MT' },
  { metal: 'Zinc', price: 3368, change: -25, unit: '$/MT' },
  { metal: 'Tin', price: 50205, change: -25, unit: '$/MT' },
  { metal: 'Crude', price: 87.15, change: 0.21, unit: '$/barrel' },
  { metal: 'Gold', price: 5179.96, change: 43.04, unit: '$/oz' },
  { metal: 'Silver', price: 88.91, change: 1.90, unit: '$/oz' },
];

const MCX_RATES = [
  { metal: 'Copper', price: 1206, change: 12.55, unit: '₹/Kg' },
  { metal: 'Aluminium', price: 333.6, change: -2.35, unit: '₹/Kg' },
  { metal: 'Nickel', price: 1586.5, change: 0.3, unit: '₹/Kg' },
  { metal: 'Lead', price: 188.65, change: 0.45, unit: '₹/Kg' },
  { metal: 'Zinc', price: 327.3, change: 2.1, unit: '₹/Kg' },
  { metal: 'Crude', price: 8022, change: -760, unit: '₹/barrel' },
  { metal: 'Gold', price: 161900, change: 1601, unit: '₹/10g' },
  { metal: 'Silver', price: 276370, change: 9210, unit: '₹/kg' },
  { metal: 'Natural Gas', price: 284, change: -6.4, unit: '₹/mmBtu' },
];

const FOREX_RATES = [
  { pair: 'USD/INR', price: 91.797, change: -0.333 },
  { pair: 'EUR/USD', price: 1.1647, change: 0.0011 },
  { pair: 'Nifty', price: 24274.45, change: 246.4 },
  { pair: 'Sensex', price: 78246.97, change: 680.81 },
];

async function main() {
  console.log('🌱 Seeding MetalXpress database...');

  // Clear existing data
  await prisma.rate.deleteMany();
  await prisma.rateUpdate.deleteMany();
  await prisma.lMERate.deleteMany();
  await prisma.mCXRate.deleteMany();
  await prisma.forexRate.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.contributor.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.metal.deleteMany();
  await prisma.oTPSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hub.deleteMany();
  await prisma.city.deleteMany();

  // Seed cities and hubs
  const cityMap = {};
  const hubMap = {};

  for (const cityData of CITIES) {
    const city = await prisma.city.create({
      data: {
        name: cityData.name,
        slug: cityData.slug,
        hubs: {
          create: cityData.hubs.map(h => ({ name: h.name, slug: h.slug })),
        },
      },
      include: { hubs: true },
    });
    cityMap[cityData.slug] = city;
    for (const hub of city.hubs) {
      hubMap[hub.slug] = hub;
    }
    console.log(`  ✅ City: ${city.name} (${city.hubs.length} hubs)`);
  }

  // Seed metals and grades
  const metalMap = {};
  const gradeMap = {}; // metalName:gradeName → grade

  for (const metalData of METALS) {
    const metal = await prisma.metal.create({
      data: {
        name: metalData.name,
        emoji: metalData.emoji,
        colorHex: metalData.colorHex,
        sortOrder: metalData.sortOrder,
        grades: {
          create: metalData.grades.map(g => ({
            name: g.name,
            hasVariants: g.hasVariants || false,
            variantLabel: g.variantLabel || null,
          })),
        },
      },
      include: { grades: true },
    });
    metalMap[metalData.name] = metal;
    for (const grade of metal.grades) {
      gradeMap[`${metalData.name}:${grade.name}`] = grade;
    }
    console.log(`  ✅ Metal: ${metal.emoji} ${metal.name} (${metal.grades.length} grades)`);
  }

  // Seed LME rates
  for (const rate of LME_RATES) {
    await prisma.lMERate.create({ data: rate });
  }
  console.log(`  ✅ LME rates: ${LME_RATES.length}`);

  // Seed MCX rates
  for (const rate of MCX_RATES) {
    await prisma.mCXRate.create({ data: rate });
  }
  console.log(`  ✅ MCX rates: ${MCX_RATES.length}`);

  // Seed Forex rates
  for (const rate of FOREX_RATES) {
    await prisma.forexRate.create({ data: rate });
  }
  console.log(`  ✅ Forex rates: ${FOREX_RATES.length}`);

  // Seed contributor
  const delhiCity = cityMap['delhi'];
  const contributor = await prisma.contributor.create({
    data: {
      name: 'Mandoli Trader',
      phone: '9999999999',
      cityId: delhiCity.id,
      isVerified: true,
    },
  });
  console.log(`  ✅ Contributor: ${contributor.name}`);

  // Seed Delhi Mandoli rates
  const mandoliHub = hubMap['mandoli-delhi'];
  const rateUpdate = await prisma.rateUpdate.create({
    data: {
      hubId: mandoliHub.id,
      contributorId: contributor.id,
      rawMessage: 'Seeded from reference WhatsApp message',
    },
  });

  let rateCount = 0;
  for (const [metalName, grades] of Object.entries(DELHI_MANDOLI_RATES)) {
    for (const [gradeName, rateData] of Object.entries(grades)) {
      const key = `${metalName}:${gradeName}`;
      const grade = gradeMap[key];
      if (!grade) {
        console.warn(`  ⚠️  Grade not found: ${key}`);
        continue;
      }
      await prisma.rate.create({
        data: {
          gradeId: grade.id,
          hubId: mandoliHub.id,
          buyPrice: rateData.buyPrice || null,
          sellPrice: rateData.sellPrice || null,
          variantPrice: rateData.variantPrice || null,
          variantLabel: rateData.variantLabel || null,
          rateUpdateId: rateUpdate.id,
        },
      });
      rateCount++;
    }
  }
  console.log(`  ✅ Delhi Mandoli rates: ${rateCount}`);

  // Seed sample marketplace listings
  const testUser = await prisma.user.create({
    data: {
      phone: '9876543210',
      name: 'Rajesh Kumar',
      city: 'Delhi',
      traderType: 'SELLER',
    },
  });

  const copperMetal = metalMap['Copper'];
  const brassMetal = metalMap['Brass'];
  const alumMetal = metalMap['Aluminium'];

  const listings = [
    {
      userId: testUser.id,
      metalId: copperMetal.id,
      gradeId: gradeMap['Copper:Armature Bhatti']?.id || null,
      qty: 500,
      unit: 'kg',
      location: 'Mandoli, Delhi',
      price: 1140,
      description: 'Good quality armature copper scrap. Available immediately.',
      contact: '9876543210',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      userId: testUser.id,
      metalId: brassMetal.id,
      gradeId: gradeMap['Brass:Purja']?.id || null,
      qty: 200,
      unit: 'kg',
      location: 'Kurla, Mumbai',
      price: 670,
      description: 'Brass purja scrap, clean, no iron mixed.',
      contact: '9876543211',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      userId: testUser.id,
      metalId: alumMetal.id,
      gradeId: gradeMap['Aluminium:Ingot']?.id || null,
      qty: 1000,
      unit: 'kg',
      location: 'Dharavi, Mumbai',
      price: null,
      description: 'Aluminium ingot scrap lot. Best offer invited. Serious buyers only.',
      contact: '9876543212',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const l of listings) {
    await prisma.listing.create({ data: l });
  }
  console.log(`  ✅ Sample listings: ${listings.length}`);

  console.log('\n🎉 Seed complete!');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
