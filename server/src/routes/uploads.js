const router = require('express').Router();
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { httpError } = require('../util');

const ALLOWED = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '../../uploads'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ALLOWED[file.mimetype]}`),
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(ALLOWED[file.mimetype] ? null : httpError(400, 'Only JPG, PNG, WEBP or GIF images are allowed'), !!ALLOWED[file.mimetype]),
});

router.post('/', requireAuth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return next(httpError(400, 'Image must be under 3 MB'));
      return next(err.status ? err : httpError(400, err.message));
    }
    if (!req.file) return next(httpError(400, 'No image received'));
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

module.exports = router;
