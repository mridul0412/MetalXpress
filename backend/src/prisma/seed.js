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
  await prisma.rating.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.deal.deleteMany();
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

  // Seed test users
  const bcrypt = require('bcryptjs');
  const testHash = await bcrypt.hash('test1234', 12);

  const rajesh = await prisma.user.create({ data: {
    phone: '9876543210', email: 'rajesh@test.com', passwordHash: testHash,
    name: 'Rajesh Kumar', city: 'Delhi', traderType: 'SELLER',
    phoneVerified: true, kycVerified: true,
  }});
  const amit = await prisma.user.create({ data: {
    phone: '9876543211', email: 'amit@test.com', passwordHash: testHash,
    name: 'Amit Sharma', city: 'Mumbai', traderType: 'BUYER',
    phoneVerified: true, kycVerified: true,
  }});
  const suresh = await prisma.user.create({ data: {
    phone: '9876543212', email: 'suresh@test.com', passwordHash: testHash,
    name: 'Suresh Patel', city: 'Ahmedabad', traderType: 'BOTH',
    phoneVerified: true, kycVerified: true,
  }});
  const priya = await prisma.user.create({ data: {
    phone: '9876543213', email: 'priya@test.com', passwordHash: testHash,
    name: 'Priya Verma', city: 'Chennai', traderType: 'SELLER',
    phoneVerified: true, kycVerified: false,
  }});
  const vikram = await prisma.user.create({ data: {
    phone: '9876543214', email: 'vikram@test.com', passwordHash: testHash,
    name: 'Vikram Singh', city: 'Ludhiana', traderType: 'BUYER',
    phoneVerified: true, kycVerified: true,
  }});

  const userMap = {
    'Rajesh Kumar': rajesh,
    'Amit Sharma': amit,
    'Suresh Patel': suresh,
    'Priya Verma': priya,
    'Vikram Singh': vikram,
  };

  // Owner test account with pro subscription (email: test@metalxpress.in, password: test1234)
  const ownerHash = await bcrypt.hash('test1234', 12);
  const ownerUser = await prisma.user.create({
    data: {
      email: 'test@metalxpress.in',
      passwordHash: ownerHash,
      phone: '9999900000',
      name: 'MX Pro Tester',
      city: 'Delhi',
      traderType: 'BOTH',
      phoneVerified: true,
    },
  });
  console.log(`  ✅ Pro test user: test@metalxpress.in / test1234`);

  // Admin test account with full subscription access (email: admin@metalxpress.in, password: admin1234)
  const adminHash = await bcrypt.hash('admin1234', 12);
  await prisma.user.create({
    data: {
      email: 'admin@metalxpress.in',
      passwordHash: adminHash,
      phone: '9999900001',
      name: 'MX Admin',
      city: 'Delhi',
      traderType: 'BOTH',
      phoneVerified: true,
      kycVerified: true,
    },
  });
  console.log(`  ✅ Admin user: admin@metalxpress.in / admin1234 (full pro access)`);
  console.log(`  ✅ Test users: 7 (5 traders + pro tester + admin)`);

  // Seed sample marketplace listings (10 diverse listings)
  const copperMetal = metalMap['Copper'];
  const brassMetal = metalMap['Brass'];
  const alumMetal = metalMap['Aluminium'];
  const leadMetal = metalMap['Lead'];
  const zincMetal = metalMap['Zinc'];

  const listings = [
    {
      userId: rajesh.id, metalId: copperMetal.id,
      gradeId: gradeMap['Copper:Armature Bhatti']?.id || null,
      qty: 500, location: 'Mandoli, Delhi', price: 1140,
      description: 'Good quality armature copper scrap. Available immediately. Regular supply.',
      contact: '9876543210', status: 'verified',
      images: JSON.stringify(['/uploads/seed-copper-armature-1.jpg', '/uploads/seed-copper-armature-2.jpg']),
    },
    {
      userId: rajesh.id, metalId: copperMetal.id,
      gradeId: gradeMap['Copper:CC Rod']?.id || null,
      qty: 2000, location: 'Mandoli, Delhi', price: 1240,
      description: 'CC Rod copper, premium quality. 2 ton lot ready for dispatch.',
      contact: '9876543210', status: 'verified',
      images: JSON.stringify(['/uploads/seed-copper-cc-rod-1.jpg', '/uploads/seed-copper-cc-rod-2.jpg', '/uploads/seed-copper-cc-rod-3.jpg']),
    },
    {
      userId: amit.id, metalId: brassMetal.id,
      gradeId: gradeMap['Brass:Purja']?.id || null,
      qty: 800, location: 'Kurla, Mumbai', price: 670,
      description: 'Brass purja scrap, clean, no iron mixed. Can deliver within Mumbai.',
      contact: '9876543211', status: 'verified',
      images: JSON.stringify(['/uploads/seed-brass-purja-1.jpg', '/uploads/seed-brass-purja-2.jpg', '/uploads/seed-brass-purja-video.mp4']),
    },
    {
      userId: suresh.id, metalId: alumMetal.id,
      gradeId: gradeMap['Aluminium:Ingot']?.id || null,
      qty: 3000, location: 'Naroda, Ahmedabad', price: 335,
      description: 'Aluminium ingot scrap lot. Best offer invited. Serious buyers only.',
      contact: '9876543212', status: 'verified',
      images: JSON.stringify(['/uploads/seed-aluminium-ingot-1.jpg', '/uploads/seed-aluminium-ingot-2.jpg']),
    },
    {
      userId: suresh.id, metalId: zincMetal.id,
      gradeId: gradeMap['Zinc:Slab']?.id || null,
      qty: 1500, location: 'Naroda, Ahmedabad', price: 334,
      description: 'Zinc slab — full truck load available. Ready for pickup.',
      contact: '9876543212', status: 'pending',
      images: JSON.stringify(['/uploads/seed-zinc-slab-1.jpg', '/uploads/seed-zinc-slab-2.jpg']),
    },
    {
      userId: priya.id, metalId: leadMetal.id,
      gradeId: gradeMap['Lead:Battery']?.id || null,
      qty: 10000, location: 'Ambattur, Chennai', price: 112,
      description: 'Used battery lead scrap. Monthly supply available. ISO certified recycler.',
      contact: '9876543213', status: 'verified',
      images: JSON.stringify(['/uploads/seed-lead-battery-1.jpg', '/uploads/seed-lead-battery-2.jpg', '/uploads/seed-lead-battery-video.mp4']),
    },
    {
      userId: priya.id, metalId: brassMetal.id,
      gradeId: gradeMap['Brass:Honey']?.id || null,
      qty: 600, location: 'Chennai', price: null,
      description: 'Brass honey scrap — looking for buyers. Rate negotiable based on volume.',
      contact: '9876543213', status: 'pending',
      images: JSON.stringify(['/uploads/seed-brass-honey-1.jpg', '/uploads/seed-brass-honey-2.jpg']),
    },
    {
      userId: vikram.id, metalId: copperMetal.id,
      gradeId: gradeMap['Copper:CCR']?.id || null,
      qty: 1000, location: 'Focal Point, Ludhiana', price: 1300,
      description: 'CCR copper available. Factory surplus from cable manufacturing.',
      contact: '9876543214', status: 'verified',
      images: JSON.stringify(['/uploads/seed-copper-ccr-1.jpg', '/uploads/seed-copper-ccr-2.jpg', '/uploads/seed-copper-ccr-3.jpg']),
    },
    {
      userId: vikram.id, metalId: alumMetal.id,
      gradeId: gradeMap['Aluminium:Wire Scrap']?.id || null,
      qty: 2500, location: 'Ludhiana', price: 300,
      description: 'Aluminium wire scrap for recycling. Have stock from power cable project.',
      contact: '9876543214', status: 'verified',
      images: JSON.stringify(['/uploads/seed-aluminium-wire-1.jpg', '/uploads/seed-aluminium-wire-2.jpg']),
    },
  ];

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const createdListings = [];
  for (const l of listings) {
    const listing = await prisma.listing.create({ data: { ...l, unit: 'kg', expiresAt } });
    createdListings.push(listing);
  }
  console.log(`  ✅ Sample listings: ${listings.length} (with images)`);

  // ── Sample completed deals with offer history and ratings ──

  const pastDate = (daysAgo) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  // Deal 1: Rajesh (seller) → Amit (buyer), Copper CC Rod, 500kg @ 1150/kg
  const deal1 = await prisma.deal.create({ data: {
    listingId: createdListings[1].id, // CC Rod listing
    buyerId: amit.id,
    sellerId: rajesh.id,
    agreedPrice: 1150,
    agreedQty: 500,
    dealAmount: 575000,
    commission: 575,
    status: 'completed',
    lastOfferAt: pastDate(12),
    paidAt: pastDate(11),
    completedAt: pastDate(8),
  }});

  // Deal 1 offers: Amit offered 1130, Rajesh countered 1150, Amit accepted
  await prisma.offer.create({ data: {
    dealId: deal1.id, fromUserId: amit.id,
    pricePerKg: 1130, qty: 500, message: 'Can you do 1130? Need 500kg for factory order.',
    status: 'countered', createdAt: pastDate(14),
  }});
  await prisma.offer.create({ data: {
    dealId: deal1.id, fromUserId: rajesh.id,
    pricePerKg: 1150, qty: 500, message: 'Best I can do is 1150. Premium quality CC Rod.',
    status: 'accepted', createdAt: pastDate(12),
  }});

  // Deal 1 ratings
  await prisma.rating.create({ data: {
    dealId: deal1.id, fromUserId: amit.id, toUserId: rajesh.id,
    score: 5, comment: 'Excellent quality copper, delivered on time',
  }});
  await prisma.rating.create({ data: {
    dealId: deal1.id, fromUserId: rajesh.id, toUserId: amit.id,
    score: 4, comment: 'Prompt payment, good buyer',
  }});

  // Deal 2: Suresh (seller) → Amit (buyer), Brass Purja, 1000kg @ 650/kg
  const deal2 = await prisma.deal.create({ data: {
    listingId: createdListings[2].id, // Brass Purja listing (Amit's listing, but Suresh sells here)
    buyerId: amit.id,
    sellerId: suresh.id,
    agreedPrice: 650,
    agreedQty: 1000,
    dealAmount: 650000,
    commission: 650,
    status: 'completed',
    lastOfferAt: pastDate(20),
    paidAt: pastDate(19),
    completedAt: pastDate(15),
  }});

  // Deal 2 offers
  await prisma.offer.create({ data: {
    dealId: deal2.id, fromUserId: amit.id,
    pricePerKg: 640, qty: 1000, message: 'Looking for 1 ton brass purja. Can you do 640?',
    status: 'countered', createdAt: pastDate(22),
  }});
  await prisma.offer.create({ data: {
    dealId: deal2.id, fromUserId: suresh.id,
    pricePerKg: 650, qty: 1000, message: 'Clean brass, no iron mixed. 650 is fair price.',
    status: 'accepted', createdAt: pastDate(20),
  }});

  // Deal 2 ratings
  await prisma.rating.create({ data: {
    dealId: deal2.id, fromUserId: amit.id, toUserId: suresh.id,
    score: 4, comment: 'Good brass quality, slight delay in delivery',
  }});
  await prisma.rating.create({ data: {
    dealId: deal2.id, fromUserId: suresh.id, toUserId: amit.id,
    score: 5, comment: 'Very reliable buyer, immediate payment',
  }});

  // Deal 3: Vikram (seller) → Rajesh (buyer), Aluminium Wire Scrap, 800kg @ 290/kg
  const deal3 = await prisma.deal.create({ data: {
    listingId: createdListings[8].id, // Aluminium Wire Scrap listing
    buyerId: rajesh.id,
    sellerId: vikram.id,
    agreedPrice: 290,
    agreedQty: 800,
    dealAmount: 232000,
    commission: 232,
    status: 'completed',
    lastOfferAt: pastDate(7),
    paidAt: pastDate(6),
    completedAt: pastDate(3),
  }});

  // Deal 3 offers
  await prisma.offer.create({ data: {
    dealId: deal3.id, fromUserId: rajesh.id,
    pricePerKg: 280, qty: 800, message: 'Need 800kg aluminium wire scrap for recycling unit.',
    status: 'countered', createdAt: pastDate(9),
  }});
  await prisma.offer.create({ data: {
    dealId: deal3.id, fromUserId: vikram.id,
    pricePerKg: 295, qty: 800, message: 'High grade wire from power cable project. 295 minimum.',
    status: 'countered', createdAt: pastDate(8),
  }});
  await prisma.offer.create({ data: {
    dealId: deal3.id, fromUserId: rajesh.id,
    pricePerKg: 290, qty: 800, message: 'Let us meet at 290. Deal?',
    status: 'accepted', createdAt: pastDate(7),
  }});

  // Deal 3 ratings
  await prisma.rating.create({ data: {
    dealId: deal3.id, fromUserId: rajesh.id, toUserId: vikram.id,
    score: 5, comment: 'Top quality aluminium, will deal again',
  }});
  await prisma.rating.create({ data: {
    dealId: deal3.id, fromUserId: vikram.id, toUserId: rajesh.id,
    score: 5, comment: 'Experienced trader, smooth transaction',
  }});

  console.log(`  ✅ Sample deals: 3 (completed with offer history)`);
  console.log(`  ✅ Sample ratings: 6`);

  // Recalculate user stats from ratings
  for (const user of [rajesh, suresh, amit, vikram]) {
    const agg = await prisma.rating.aggregate({ where: { toUserId: user.id }, _avg: { score: true }, _count: true });
    if (agg._count > 0) {
      await prisma.user.update({ where: { id: user.id }, data: { avgRating: agg._avg.score || 0, completedDeals: agg._count } });
    }
  }
  console.log(`  ✅ User stats recalculated from ratings`);

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
