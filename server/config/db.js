const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '39.108.235.72',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'abcd',
  password: process.env.DB_PASSWORD || 'pfELWYmPKX5T5x4S',
  database: process.env.DB_NAME || 'zz',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试连接
pool.getConnection()
  .then(conn => {
    console.log('[MySQL] 数据库连接成功');
    conn.release();
  })
  .catch(err => {
    console.error('[MySQL] 数据库连接失败:', err.message);
  });

module.exports = pool;
