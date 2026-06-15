const express = require('express');
const router = express.Router();
const clientCtrl = require('../controllers/clientController');
const payCtrl = require('../controllers/payController');

// 商家主页
router.get('/home/:merchantId', clientCtrl.getHome);

// 内容详情
router.get('/post/:id', clientCtrl.getPostDetail);

// 发起支付
router.post('/pay', payCtrl.createPay);

// 支付回调
router.post('/pay/callback', payCtrl.payCallback);

module.exports = router;
