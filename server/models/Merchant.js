const pool = require('../config/db');

const Merchant = {
  // 根据手机号查找
  async findByPhone(phone) {
    const [rows] = await pool.query('SELECT * FROM merchants WHERE phone = ?', [phone]);
    return rows[0] || null;
  },

  // 根据用户名查找（账号密码登录）
  async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM merchants WHERE username = ?', [username]);
    return rows[0] || null;
  },

  // 根据ID查找
  async findById(id) {
    const [rows] = await pool.query('SELECT id, phone, name, avatar, intro, qrcode_id, status, created_at FROM merchants WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // 新建商家（首次登录自动注册）
  async create(phone) {
    const { v4: uuidv4 } = require('uuid');
    const qrcodeId = uuidv4().replace(/-/g, '');
    const [result] = await pool.query(
      'INSERT INTO merchants (phone, qrcode_id) VALUES (?, ?)',
      [phone, qrcodeId]
    );
    return { id: result.insertId, phone, qrcode_id: qrcodeId };
  },

  // 更新商家信息
  async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['name', 'avatar', 'intro'];
    allowed.forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });
    if (fields.length === 0) return null;
    values.push(id);
    await pool.query(`UPDATE merchants SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  // 根据二维码ID查找
  async findByQrcodeId(qrcodeId) {
    const [rows] = await pool.query(
      'SELECT id, name, avatar, intro, qrcode_id, status FROM merchants WHERE qrcode_id = ? AND status = 1',
      [qrcodeId]
    );
    return rows[0] || null;
  },

  // 更新二维码ID
  async updateQrcodeId(id, qrcodeId) {
    await pool.query('UPDATE merchants SET qrcode_id = ? WHERE id = ?', [qrcodeId, id]);
  }
};

module.exports = Merchant;
