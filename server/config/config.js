require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 3333,
  jwtSecret: process.env.JWT_SECRET || 'fukuang_jwt_secret_2026',
  jwtExpiresIn: '7d',

  // 微信支付配置
  wechat: {
    appId: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || '',
    mchId: process.env.WECHAT_MCHID || '',
    apiKey: process.env.WECHAT_API_KEY || '',
    notifyUrl: '' // 支付回调地址，部署后填写
  },

  // 短信配置
  sms: {
    accessKey: process.env.SMS_ACCESS_KEY || '',
    accessSecret: process.env.SMS_ACCESS_SECRET || ''
  }
};
