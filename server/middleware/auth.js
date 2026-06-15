const jwt = require('jsonwebtoken');
const config = require('../config/config');

// JWT 鉴权中间件 - 商家端
function authMerchant(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ code: 401, message: '请先登录' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.merchantId = decoded.id;
    req.merchantPhone = decoded.phone;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
  }
}

module.exports = { authMerchant };
