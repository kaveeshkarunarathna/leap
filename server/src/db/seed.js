// Adds sample listings so the site isn't empty while you test it.
// Usage: npm run seed   (safe to run once; skips if the demo account already exists)
// Remove later by deleting the user demo@leap.local in the admin panel or via SQL.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const pool = require('./pool');
const { migrate } = require('./migrate');

const SAMPLES = [
  { name: 'Nimbus Code Labs', cat: 'technology-it', district: 'Gampaha', city: 'Biyagama', tagline: 'Web & mobile apps for small businesses',
    description: 'We build fast, modern websites and apps for Sri Lankan SMEs, from idea to launch.',
    items: [['service', 'Business website', 'Responsive 5-page site with hosting setup', 'From LKR 45,000'], ['service', 'Mobile app MVP', 'Android + iOS app built with React Native', 'Quote on request']] },
  { name: 'Ceylon Spice Craft', cat: 'food-beverage', district: 'Kandy', city: 'Peradeniya', tagline: 'Hand-blended spices from the hill country',
    description: 'Small-batch spice blends and curry powders made with locally sourced ingredients.',
    items: [['product', 'Roasted curry powder 250g', null, 'LKR 850'], ['product', 'Cinnamon gift box', 'Alba-grade Ceylon cinnamon', 'LKR 2,400']] },
  { name: 'Lumen Studio', cat: 'events-photography', district: 'Colombo', city: 'Nugegoda', tagline: 'Wedding & event photography',
    description: 'Cinematic photo and video coverage for weddings, corporate events and Leo projects.',
    items: [['service', 'Wedding full-day package', 'Two photographers, edited album', 'LKR 150,000'], ['service', 'Event coverage (4h)', null, 'LKR 35,000']] },
  { name: 'Threadline Apparel', cat: 'fashion-apparel', district: 'Gampaha', city: 'Kiribathgoda', tagline: 'Custom T-shirts and club merchandise',
    description: 'Screen-printed and embroidered apparel for clubs, schools and events. Low minimum orders.',
    items: [['product', 'Custom club T-shirt', 'Min. 20 pieces', 'LKR 1,350 each'], ['service', 'Embroidery', null, 'Quote on request']] },
  { name: 'GreenRoot Farms', cat: 'agriculture', district: 'Kurunegala', city: 'Kuliyapitiya', tagline: 'Organic vegetables, delivered weekly',
    description: 'Pesticide-free vegetables and fruits harvested to order and delivered to Gampaha and Colombo.',
    items: [['product', 'Weekly veg box', '5 kg seasonal mix', 'LKR 3,200']] },
  { name: 'Brightpath Tutors', cat: 'education-training', district: 'Galle', city: 'Galle', tagline: 'O/L and A/L tutoring, online and in person',
    description: 'Experienced tutors for maths, science and ICT with small group classes.',
    items: [['service', 'A/L Combined Maths', 'Weekly group class', 'LKR 4,000 / month'], ['service', 'ICT crash course', null, 'LKR 6,500']] },
];

(async () => {
  await migrate();
  const [existing] = await pool.query("SELECT id FROM users WHERE email = 'demo@leap.local'");
  if (existing.length) { console.log('Demo data already present'); process.exit(0); }
  const hash = await bcrypt.hash('demo12345', 10);
  const [u] = await pool.query(
    "INSERT INTO users (name, email, password_hash, leo_club, leo_id) VALUES ('Demo Leo', 'demo@leap.local', ?, 'Leo Club of Biyagama Alliance', 'DEMO-001')",
    [hash]
  );
  for (const [i, s] of SAMPLES.entries()) {
    const [[cat]] = await pool.query('SELECT id FROM categories WHERE slug = ?', [s.cat]);
    const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const [b] = await pool.query(
      `INSERT INTO businesses (owner_id, category_id, name, slug, tagline, description, district, city, phone, status, featured, views)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '+94 77 000 0000', 'approved', ?, ?)`,
      [u.insertId, cat?.id || null, s.name, slug, s.tagline, s.description, s.district, s.city, i < 2 ? 1 : 0, 20 + i * 7]
    );
    for (const [j, [type, title, desc, price]] of s.items.entries()) {
      await pool.query('INSERT INTO offerings (business_id, type, title, description, price, sort_order) VALUES (?, ?, ?, ?, ?, ?)', [b.insertId, type, title, desc, price, j]);
    }
  }
  console.log(`Added ${SAMPLES.length} demo businesses (login: demo@leap.local / demo12345)`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
