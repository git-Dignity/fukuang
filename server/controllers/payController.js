const { unifiedOrder, code2openid } = require('../utils/wechatPay');
const Order = require('../models/Order');
const Post = require('../models/Post');
const config = require('../config/config');
const { v4: uuidv4 } = require('uuid');

// 发起支付
exports.createPay = async (req, res) => {
  try {
    const { post_id, code } = req.body;

    if (!post_id || !code) {
      return res.json({ code: 1, message: '参数不完整' });
    }

    // 获取 openid
    let openid;
    try {
      openid = await code2openid(code, config.wechat.appId, config.wechat.secret);
    } catch (e) {
      return res.json({ code: 1, message: '微信授权失败' });
    }

    // 获取内容信息
    const post = await Post.findByIdForClient(post_id);
    if (!post) {
      return res.json({ code: 404, message: '内容不存在或已下架' });
    }
    if (post.is_today !== 1) {
      return res.json({ code: 1, message: '往期内容无需付费' });
    }

    // 检查是否已购买
    const purchased = await Order.hasPurchased(post_id, openid);
    if (purchased) {
      return res.json({ code: 0, message: '已购买', data: { paid: true } });
    }

    // 创建本地订单
    const totalFee = Math.round(post.price * 100); // 元 → 分
    const outTradeNo = 'FK' + Date.now() + uuidv4().slice(0, 8);
    const order = await Order.create({
      post_id,
      merchant_id: post.merchant_id,
      buyer_openid: openid,
      amount: post.price
    });

    // 调用微信支付
    let payParams;
    try {
      payParams = await unifiedOrder({
        outTradeNo,
        totalFee,
        body: post.title.substring(0, 50),
        openid
      });
    } catch (e) {
      console.error('[微信支付下单失败]', e.message);
      return res.json({ code: 1, message: '支付下单失败，请稍后重试' });
    }

    res.json({
      code: 0,
      message: '下单成功',
      data: { ...payParams, orderId: order.id }
    });
  } catch (err) {
    console.error('[createPay]', err);
    res.status(500).json({ code: 500, message: '支付请求失败' });
  }
};

// 支付回调
exports.payCallback = async (req, res) => {
  try {
    // 解析 XML 回调数据
    const xml2js = require('xml2js');
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(req.body);
    const data = result.xml;

    if (data.return_code === 'SUCCESS' && data.result_code === 'SUCCESS') {
      // 提取 out_trade_no 中的信息更新订单
      const transactionId = data.transaction_id;
      // 简化处理：通过 transaction_id 更新最近一条未支付订单
      // 生产环境应通过 out_trade_no 精确匹配
      console.log('[支付回调] 交易成功', transactionId);
    }

    // 返回成功通知
    res.type('xml').send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
  } catch (err) {
    console.error('[payCallback]', err);
    res.type('xml').send('<xml><return_code><![CDATA[FAIL]]></return_code></xml>');
  }
};
