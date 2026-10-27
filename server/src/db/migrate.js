const fs = require('fs');
const path = require('path');
const pool = require('./pool');

const DEFAULT_CATEGORIES = [
  ['Food & Beverage', 'food-beverage', 'utensils'],
  ['Fashion & Apparel', 'fashion-apparel', 'shirt'],
  ['Technology & IT', 'technology-it', 'cpu'],
  ['Design & Creative', 'design-creative', 'palette'],
  ['Education & Training', 'education-training', 'graduation-cap'],
  ['Health & Beauty', 'health-beauty', 'heart-pulse'],
  ['Events & Photography', 'events-photography', 'camera'],
  ['Home & Living', 'home-living', 'home'],
  ['Handicrafts & Gifts', 'handicrafts-gifts', 'gift'],
  ['Agriculture', 'agriculture', 'sprout'],
  ['Professional Services', 'professional-services', 'briefcase'],
  ['Other', 'other', 'sparkles'],
];

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const statements = sql
    .split(/;\s*$/m)
    .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
    .filter(Boolean);
  for (const stmt of statements) await pool.query(stmt);

  const [[{ n }]] = await pool.query('SELECT COUNT(*) AS n FROM categories');
  if (n === 0) {
    await pool.query('INSERT INTO categories (name, slug, icon, sort_order) VALUES ?', [
      DEFAULT_CATEGORIES.map((c, i) => [...c, i]),
    ]);
  }

  // First-run admin: set ADMIN_EMAIL and ADMIN_PASSWORD to create one when no admin exists yet.
  // Handy on shared hosting without terminal access. Remove the password from the env afterwards.
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const [[{ admins }]] = await pool.query("SELECT COUNT(*) AS admins FROM users WHERE role = 'admin'");
    if (admins === 0) {
      const hash = await require('bcryptjs').hash(ADMIN_PASSWORD, 10);
      await pool.query(
        `INSERT INTO users (name, email, password_hash, leo_club, role) VALUES ('LEAP Admin', ?, ?, 'Leo Club of Biyagama Alliance', 'admin')
         ON DUPLICATE KEY UPDATE role = 'admin', password_hash = VALUES(password_hash), status = 'active'`,
        [ADMIN_EMAIL.toLowerCase().trim(), hash]
      );
      console.log(`Created admin account ${ADMIN_EMAIL}`);
    }
  }
}

module.exports = { migrate };

if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
  migrate()
    .then(() => { console.log('Database is up to date'); process.exit(0); })
    .catch((e) => { console.error(e); process.exit(1); });
}
