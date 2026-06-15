const pool = require('../config/db');
const dayjs = require('dayjs');

const Post = {
  // 创建帖子
  async create(data) {
    const {
      merchant_id, title, lianhong_tag, tag, summary,
      paid_content, image_url, price, is_presale, post_type
    } = data;

    const [result] = await pool.query(
      `INSERT INTO posts (merchant_id, title, lianhong_tag, tag, summary, paid_content, image_url, price, is_presale, post_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [merchant_id, title, lianhong_tag || '', tag || '', summary || '', paid_content, image_url || '', price || 9.90, is_presale ? 1 : 0, post_type || 'normal']
    );
    return { id: result.insertId };
  },

  // 更新帖子
  async update(id, merchantId, data) {
    const fields = [];
    const values = [];
    const allowed = ['title', 'lianhong_tag', 'tag', 'summary', 'paid_content', 'image_url', 'price', 'is_presale', 'post_type', 'status'];
    allowed.forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });
    if (fields.length === 0) return null;
    values.push(id, merchantId);
    const [result] = await pool.query(
      `UPDATE posts SET ${fields.join(', ')} WHERE id = ? AND merchant_id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  // 删除帖子
  async delete(id, merchantId) {
    const [result] = await pool.query('DELETE FROM posts WHERE id = ? AND merchant_id = ?', [id, merchantId]);
    return result.affectedRows > 0;
  },

  // 上下架切换
  async toggleStatus(id, merchantId) {
    const [result] = await pool.query(
      'UPDATE posts SET status = IF(status = 1, 0, 1) WHERE id = ? AND merchant_id = ?',
      [id, merchantId]
    );
    return result.affectedRows > 0;
  },

  // 获取商家帖子列表（后台管理）
  async findByMerchant(merchantId, filters = {}) {
    let sql = 'SELECT * FROM posts WHERE merchant_id = ?';
    const params = [merchantId];

    if (filters.post_type) {
      sql += ' AND post_type = ?';
      params.push(filters.post_type);
    }
    if (filters.status !== undefined) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  // 客户端：获取商家主页列表（区分今日/往期）
  async findByMerchantForClient(merchantId) {
    const today = dayjs().format('YYYY-MM-DD');
    const [rows] = await pool.query(
      `SELECT id, title, lianhong_tag, tag, summary, image_url, price, is_presale, post_type, created_at,
              CASE WHEN DATE(created_at) = ? THEN 1 ELSE 0 END AS is_today
       FROM posts
       WHERE merchant_id = ? AND status = 1
       ORDER BY created_at DESC`,
      [today, merchantId]
    );
    return rows;
  },

  // 获取单个帖子详情（客户端用）
  async findByIdForClient(postId) {
    const today = dayjs().format('YYYY-MM-DD');
    const [rows] = await pool.query(
      `SELECT id, merchant_id, title, lianhong_tag, tag, summary, paid_content, image_url, price, is_presale, post_type, created_at,
              CASE WHEN DATE(created_at) = ? THEN 1 ELSE 0 END AS is_today
       FROM posts WHERE id = ? AND status = 1`,
      [today, postId]
    );
    return rows[0] || null;
  },

  // 获取单个帖子详情（商家自己用）
  async findById(id, merchantId) {
    const [rows] = await pool.query(
      'SELECT * FROM posts WHERE id = ? AND merchant_id = ?',
      [id, merchantId]
    );
    return rows[0] || null;
  }
};

module.exports = Post;
