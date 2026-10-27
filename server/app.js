// Entry point. cPanel "Setup Node.js App" should use this file as the startup file.
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { migrate } = require('./src/db/migrate');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) }));
}
app.use(express.json({ limit: '1mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir, { maxAge: '30d' }));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api', require('./src/routes/public'));
app.use('/api/my', require('./src/routes/my'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/uploads', require('./src/routes/uploads'));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Serve the built React app (copied into ./public by `npm run build` in /client).
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir, { index: false, maxAge: '7d' }));
  app.get('*', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong' : err.message });
});

const port = process.env.PORT || 4000;
migrate()
  .then(() => app.listen(port, () => console.log(`LEAP running on port ${port}`)))
  .catch((err) => {
    console.error('Database setup failed:', err.message);
    process.exit(1);
  });
