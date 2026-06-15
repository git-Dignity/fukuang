const express = require('express');
const router = express.Router();
const { authMerchant } = require('../middleware/auth');
const ctrl = require('../controllers/merchantController');

// 公开接口（无需登录）
router.post('/send-code', ctrl.sendCode);
router.post('/login', ctrl.login);

// 需要登录的接口
router.get('/info', authMerchant, ctrl.getInfo);
router.put('/info', authMerchant, ctrl.updateInfo);
router.get('/qrcode', authMerchant, ctrl.getQrcode);
router.get('/qrcode-image', ctrl.generateQrcodeImage);
router.get('/posts/:id/qrcode', authMerchant, ctrl.getPostQrcode);
router.get('/post-qrcode-image', ctrl.generatePostQrcodeImage);

// 内容管理
router.post('/posts', authMerchant, ctrl.createPost);
router.get('/posts', authMerchant, ctrl.getPosts);
router.put('/posts/:id', authMerchant, ctrl.updatePost);
router.delete('/posts/:id', authMerchant, ctrl.deletePost);
router.put('/posts/:id/status', authMerchant, ctrl.toggleStatus);

// 订单数据
router.get('/orders', authMerchant, ctrl.getOrders);

module.exports = router;
