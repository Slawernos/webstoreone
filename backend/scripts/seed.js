/**
 * Seed script: adatbázis feltöltése 8 kategóriával és 56 termékkel
 *
 * Futtatás: node scripts/seed.js
 */

require('dotenv').config();
const { sequelize, Category, Product } = require('../src/models');

const categories = [
  { name: 'Kutyaeledel',           slug: 'kutyaeledel',           description: 'Száraz és nedves tápok, snackek kutyáknak' },
  { name: 'Kutyakiegészítők',      slug: 'kutyakiegeszitok',      description: 'Játékok, nyakörv, póráz, fekhelyek' },
  { name: 'Macskaeledel',          slug: 'macskaeledel',          description: 'Száraz és nedves tápok, snackek macskáknak' },
  { name: 'Macskakiegészítők',     slug: 'macskakiegeszitok',     description: 'Kaparó, alomdoboz, játékok, fekhelyek' },
  { name: 'Hüllőeledel',           slug: 'hulloeledel',           description: 'Élő és szárított táplálék hüllőknek' },
  { name: 'Hüllőkiegészítők',      slug: 'hullokiegeszitok',      description: 'Terrárium, UV lámpa, fűtőszőnyeg' },
  { name: 'Rágcsálóeledel',        slug: 'ragcsaloeledel',        description: 'Magkeverék, zöldség, rágcsáló snack' },
  { name: 'Rágcsálókiegészítők',   slug: 'ragcsalokiegeszitok',   description: 'Ketrec, futókerék, ital- és etetőautomata' },
];

const productsByCategory = {
  kutyaeledel: [
    { name: 'Royal Canin Medium Adult 15 kg',        price: 18990, stock: 42 },
    { name: 'Hill\'s Science Plan Adult Large 14 kg', price: 22490, stock: 28 },
    { name: 'Purina Pro Plan Sensitive 12 kg',        price: 16990, stock: 35 },
    { name: 'Brit Premium Adult M 15 kg',             price: 9990,  stock: 60 },
    { name: 'Acana Wild Prairie 11.4 kg',             price: 27990, stock: 15 },
    { name: 'Pedigree Vital Protection 10 kg',        price: 6490,  stock: 80 },
    { name: 'Animonda GranCarno Senior 800g',         price: 1290,  stock: 50 },
    { name: 'Cesar Deluxe válogatás 12×100g',         price: 2990,  stock: 45 },
  ],
  kutyakiegeszitok: [
    { name: 'Kong Classic gumijáték L',              price: 4990, stock: 30 },
    { name: 'Trixie nylon nyakörv L 45–70 cm',       price: 1990, stock: 55 },
    { name: 'Flexi New Comfort póráz 5m L',          price: 5490, stock: 22 },
    { name: 'Ferplast Siesta Deluxe 6 fekhely',      price: 8990, stock: 18 },
    { name: 'Karlie szőr-kefe dupla oldalú',         price: 2490, stock: 40 },
    { name: 'Trixie fogkefe szett kutyának',         price: 1490, stock: 35 },
    { name: 'Ruffwear Web Master hám L',             price: 19990, stock: 10 },
  ],
  macskaeledel: [
    { name: 'Royal Canin Indoor Adult 4 kg',          price: 8990,  stock: 50 },
    { name: 'Hill\'s Science Plan Sterilised 8 kg',   price: 14990, stock: 25 },
    { name: 'Purina ONE Adult Chicken 7.5 kg',        price: 9490,  stock: 38 },
    { name: 'Whiskas Alive nedves macskaeledel 12×85g', price: 2190, stock: 70 },
    { name: 'Animonda Carny Adult Beef 400g',         price: 790,   stock: 90 },
    { name: 'Brit Care Grain-free Adult Salmon 7 kg', price: 12490, stock: 20 },
    { name: 'Dreamies Tuna snack 180g',               price: 1290,  stock: 100 },
  ],
  macskakiegeszitok: [
    { name: 'Trixie Parla kaparószékhegy 163 cm',    price: 14990, stock: 12 },
    { name: 'Ferplast Bella Maxi alomdoboz',         price: 5490,  stock: 25 },
    { name: 'Catit Design Senses labdapálya',        price: 4990,  stock: 18 },
    { name: 'Pet Interactives toll+toll játék',      price: 990,   stock: 60 },
    { name: 'Trixie Harvey barlang fekhely 45 cm',   price: 7990,  stock: 15 },
    { name: 'Hagen Catit szökőkút 2 L',              price: 9990,  stock: 20 },
    { name: 'Van Ness PP4 macskatoalett fedővel',    price: 3990,  stock: 30 },
  ],
  hulloeledel: [
    { name: 'Zoo Med ReptiSticks pókhálós gomba 55g',    price: 2990, stock: 25 },
    { name: 'Lucky Reptile Herp Diner szárított tücsök', price: 1990, stock: 40 },
    { name: 'Exo Terra csincsilla-levél mix 15g',        price: 1490, stock: 30 },
    { name: 'Sera reptil Professional Herbivor 250ml',   price: 2490, stock: 20 },
    { name: 'JBL Tortil teknős granulátum 100 ml',       price: 1790, stock: 35 },
    { name: 'Repashy Crested Gecko diet 85g',            price: 3990, stock: 22 },
  ],
  hullokiegeszitok: [
    { name: 'Exo Terra Glass Terrarium 60×45×45',        price: 34990, stock: 8  },
    { name: 'Lucky Reptile Bright Sun UV Desert 35W',    price: 12990, stock: 15 },
    { name: 'Trixie Thermo Mat fűtőszőnyeg 28×28 cm',   price: 4990,  stock: 20 },
    { name: 'Exo Terra Coco Husk 8L aljzat',             price: 2990,  stock: 45 },
    { name: 'Sera Reptil Basking Spot lámpa 75W',        price: 1990,  stock: 30 },
    { name: 'Zoo Med HygroTherm digitális termosztát',   price: 14990, stock: 10 },
  ],
  ragcsaloeledel: [
    { name: 'Versele-Laga Nature Hamster 700g',         price: 1990, stock: 55 },
    { name: 'Vitakraft Menu Vital tengerimalac 4 kg',   price: 4490, stock: 30 },
    { name: 'Supreme Science Selective nyúl 1.5 kg',    price: 3490, stock: 35 },
    { name: 'Beaphar Care+ patkány 1.5 kg',             price: 2990, stock: 25 },
    { name: 'JR Farm Graslı széna 600g',                price: 1290, stock: 70 },
    { name: 'Vitakraft Kracker duplaszív rágcsáló',     price: 990,  stock: 80 },
    { name: 'Vitapol Smakers papagáj-rúd mix',          price: 890,  stock: 65 },
  ],
  ragcsalokiegeszitok: [
    { name: 'Ferplast Duna Fun Secret ketrec',          price: 19990, stock: 10 },
    { name: 'Trixie Vitarium ketrec 80×50×50 cm',       price: 24990, stock: 7  },
    { name: 'Savic Ivo 2 futókerék 27 cm',              price: 3490,  stock: 22 },
    { name: 'Nobby fajáték rágcsálóknak',               price: 1490,  stock: 50 },
    { name: 'Ferplast Sippy ital-automata 300ml',       price: 1990,  stock: 40 },
    { name: 'Trixie Sandy homokalapzat tengerimalacnak', price: 2490, stock: 30 },
    { name: 'Zolux Woody térbővítő alagút',             price: 3990,  stock: 18 },
  ],
};

async function seed() {
  await sequelize.sync({ force: true });
  console.log('✔ Táblák létrehozva');

  // Kategóriák
  const catMap = {};
  for (const c of categories) {
    const cat = await Category.create(c);
    catMap[cat.slug] = cat.id;
    console.log(`  kategória: ${cat.name}`);
  }

  // Termékek
  let total = 0;
  for (const [slug, products] of Object.entries(productsByCategory)) {
    const category_id = catMap[slug];
    for (const p of products) {
      const productSlug = p.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 80);
      await Product.create({ ...p, slug: productSlug, category_id });
      total++;
    }
    console.log(`  ${slug}: ${products.length} termék`);
  }

  console.log(`\n✔ Seed kész – ${total} termék, ${categories.length} kategória`);
  await sequelize.close();
}

seed().catch((err) => {
  console.error('Seed hiba:', err);
  process.exit(1);
});
