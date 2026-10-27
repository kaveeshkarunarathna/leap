// Usage: npm run create-admin -- admin@example.com "StrongPassword" "Full Name"
// Creates an admin, or promotes an existing account with that email to admin.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const pool = require('./pool');
const { migrate } = require('./migrate');

(async () => {
  const [email, password, name = 'LEAP Admin'] = process.argv.slice(2);
  if (!email || !password || password.length < 8) {
    console.error('Usage: npm run create-admin -- <email> <password (8+ chars)> [name]');
    process.exit(1);
  }
  await migrate();
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, leo_club, role) VALUES (?, ?, ?, 'Leo Club of Biyagama Alliance', 'admin')
     ON DUPLICATE KEY UPDATE role = 'admin', password_hash = VALUES(password_hash), status = 'active'`,
    [name, email.toLowerCase(), hash]
  );
  console.log(`Admin ready: ${email}`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
