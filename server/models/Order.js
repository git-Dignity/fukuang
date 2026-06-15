const pool = require('../config/db');

const Order = {
  // 创建订单
  async create(data) {
    const { post_id, merchant_id, buyer_openid, amount } = data;
    const [result] = await pool.query(
      'INSERT INTO orders (post_id, merchant_id, buyer_openid, amount, pay_status) VALUES (?, ?, ?, ?, 0)',
      [post_id, merchant_id, buyer_openid, amount]
    );
    return { id: result.insertId };
  },

  // 更新支付状态
  async updatePayStatus(id, transactionId) {
    const [result] = await pool.query(
      'UPDATE orders SET pay_status = 1, transaction_id = ?, paid_at = NOW() WHERE id = ? AND pay_status = 0',
      [transactionId, id]
    );
    return result.affectedRows > 0;
  },

  // 检查用户是否已购买某条内容
  async hasPurchased(postId, buyerOpenid) {
    const [rows] = await pool.query(
      'SELECT id FROM orders WHERE post_id = ? AND buyer_openid = ? AND pay_status = 1',
      [postId, buyerOpenid]
    );
    return rows.length > 0;
  },

  // 获取商家订单列表
  async findByMerchant(merchantId) {
    const [rows] = await pool.query(
      `SELECT o.*, p.title as post_title
       FROM orders o
       LEFT JOIN posts p ON o.post_id = p.id
       WHERE o.merchant_id = ?
       ORDER BY o.created_at DESC`,
      [merchantId]
    );
    return rows;
  }
};

module.exports = Order;
