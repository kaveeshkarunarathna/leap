function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Wraps async route handlers so rejected promises reach the error middleware.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .slice(0, 150) || 'business';
}

// Keeps only the listed keys, trimming strings and turning '' into null.
function pick(body, keys) {
  const out = {};
  for (const k of keys) {
    if (body[k] === undefined) continue;
    const v = typeof body[k] === 'string' ? body[k].trim() : body[k];
    out[k] = v === '' ? null : v;
  }
  return out;
}

function cleanUrl(value) {
  if (!value) return null;
  const v = String(value).trim();
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

module.exports = { httpError, wrap, slugify, pick, cleanUrl };
