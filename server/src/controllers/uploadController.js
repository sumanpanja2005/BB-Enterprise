const { Readable } = require('stream');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

/**
 * Upload buffer to Cloudinary
 */
function uploadBuffer(buffer, folder = 'bb-enterprise/products') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

/**
 * POST /api/upload/image (single)
 */
async function uploadImage(req, res, next) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      res.status(503);
      throw new Error('Image upload is not configured');
    }
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }
    const result = await uploadBuffer(req.file.buffer);
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/upload/images (multiple)
 */
async function uploadImages(req, res, next) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      res.status(503);
      throw new Error('Image upload is not configured');
    }
    if (!req.files?.length) {
      res.status(400);
      throw new Error('No files uploaded');
    }
    const urls = [];
    for (const file of req.files) {
      const result = await uploadBuffer(file.buffer);
      urls.push(result.secure_url);
    }
    res.json({ urls });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  upload,
  uploadImage,
  uploadImages,
};
