const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authMerchant } = require('../middleware/auth');

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = uuidv4() + ext;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('仅支持 jpg/jpeg/png/gif/webp 格式'));
    }
  }
});

// 上传图片
router.post('/', authMerchant, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.json({ code: 1, message: '请选择文件' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ code: 0, message: '上传成功', data: { url } });
});

module.exports = router;
