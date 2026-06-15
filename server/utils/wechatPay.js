const axios = require('axios');
const config = require('../config/config');

/**
 * 微信支付工具（V2 统一下单）
 * 生产环境需根据实际商户信息配置
 */

// 获取微信 access_token
async function getAccessToken() {
  const { appId, secret } = config.wechat;
  if (!appId || !secret) {
    throw new Error('微信 AppID 或 Secret 未配置');
  }
  const res = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
    params: { grant_type: 'client_credential', appid: appId, secret }
  });
  if (res.data.errcode) {
    throw new Error(res.data.errmsg);
  }
  return res.data.access_token;
}

// code 换 openid
async function code2openid(code, appId, secret) {
  const res = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    params: { appid: appId, secret, js_code: code, grant_type: 'authorization_code' }
  });
  if (res.data.errcode) {
    throw new Error(res.data.errmsg);
  }
  return res.data.openid;
}

// 生成随机字符串
function generateNonceStr(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

// 生成签名（V2 MD5）
function generateSign(params, apiKey) {
  const sortedKeys = Object.keys(params).sort();
  const str = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + `&key=${apiKey}`;
  const crypto = require('crypto');
  return crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}

// 统一下单
async function unifiedOrder({ outTradeNo, totalFee, body, openid, tradeType = 'JSAPI' }) {
  const { appId, mchId, apiKey, notifyUrl } = config.wechat;

  if (!appId || !mchId || !apiKey) {
    throw new Error('微信支付未配置');
  }

  const params = {
    appid: appId,
    mch_id: mchId,
    nonce_str: generateNonceStr(),
    body: body || '爆料付费内容',
    out_trade_no: outTradeNo,
    total_fee: totalFee, // 单位：分
    spbill_create_ip: '127.0.0.1',
    notify_url: notifyUrl,
    trade_type: tradeType,
    openid
  };

  params.sign = generateSign(params, apiKey);

  // 构建 XML
  const xml = '<xml>' +
    Object.keys(params).map(k => `<${k}>${params[k]}</${k}>`).join('') +
    '</xml>';

  const res = await axios.post('https://api.mch.weixin.qq.com/pay/unifiedorder', xml, {
    headers: { 'Content-Type': 'application/xml' }
  });

  // 简单解析 XML 返回（生产环境建议用 xml2js）
  const xml2js = require('xml2js');
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(res.data);
  const data = result.xml;

  if (data.return_code !== 'SUCCESS' || data.result_code !== 'SUCCESS') {
    throw new Error(data.err_code_des || data.return_msg || '下单失败');
  }

  // 返回小程序支付参数
  const payParams = {
    appId,
    timeStamp: Math.floor(Date.now() / 1000).toString(),
    nonceStr: generateNonceStr(),
    package: `prepay_id=${data.prepay_id}`,
    signType: 'MD5'
  };
  payParams.paySign = generateSign(payParams, apiKey);

  return payParams;
}

module.exports = {
  getAccessToken,
  code2openid,
  unifiedOrder,
  generateSign,
  generateNonceStr
};
