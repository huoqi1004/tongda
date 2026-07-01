import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { adminMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('仅支持图片格式: jpg, jpeg, png, gif, webp, bmp'));
    }
  },
});

const router = Router();

// POST /image - 上传产品图片
router.post('/image', adminMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 400, message: '请选择图片文件', data: null });
    }

    const url = `/uploads/${req.file.filename}`;

    res.json({
      code: 0,
      message: '图片上传成功',
      data: { url, filename: req.file.filename, size: req.file.size },
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    res.status(500).json({ code: 500, message: '图片上传失败', data: null });
  }
});

export default router;