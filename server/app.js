const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件（上传目录）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/merchant', require('./routes/merchant'));
app.use('/api/client', require('./routes/client'));
app.use('/api/upload', require('./routes/upload'));

// 健康检查
app.get('/', (req, res) => {
  res.json({ code: 0, message: 'fukuang server is running' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

app.listen(config.port, () => {
  console.log(`[Server] 服务已启动，端口: ${config.port}`);
  console.log(`[Server] 地址: http://localhost:${config.port}`);
});
