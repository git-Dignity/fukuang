const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Merchant = require('../models/Merchant');
const Post = require('../models/Post');
const Order = require('../models/Order');

// 发送验证码（简化版，生产环境需对接真实短信服务）
exports.sendCode = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.json({ code: 1, message: '请输入正确的手机号' });
    }

    // TODO: 对接真实短信服务，当前返回固定验证码 1234
    console.log(`[SMS] 手机号 ${phone} 验证码: 1234`);

    res.json({ code: 0, message: '验证码已发送' });
  } catch (err) {
    console.error('[sendCode]', err);
    res.status(500).json({ code: 500, message: '发送失败' });
  }
};

// 账号密码登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.json({ code: 1, message: '用户名和密码不能为空' });
    }

    // 根据用户名查找商家
    const merchant = await Merchant.findByUsername(username);
    if (!merchant) {
      return res.json({ code: 1, message: '用户不存在' });
    }

    // 校验密码
    if (merchant.password !== password) {
      return res.json({ code: 1, message: '密码错误' });
    }

    // 生成 token
    const token = jwt.sign(
      { id: merchant.id, username: merchant.username },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        merchant: {
          id: merchant.id,
          phone: merchant.phone,
          name: merchant.name,
          avatar: merchant.avatar,
          intro: merchant.intro,
          qrcode_id: merchant.qrcode_id
        }
      }
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ code: 500, message: '登录失败: ' + err.message });
  }
};

// 获取商家信息
exports.getInfo = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.merchantId);
    if (!merchant) {
      return res.json({ code: 404, message: '商家不存在' });
    }
    res.json({ code: 0, data: merchant });
  } catch (err) {
    console.error('[getInfo]', err);
    res.status(500).json({ code: 500, message: '获取失败' });
  }
};

// 更新商家信息
exports.updateInfo = async (req, res) => {
  try {
    const { name, intro } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (intro !== undefined) data.intro = intro;

    const merchant = await Merchant.update(req.merchantId, data);
    res.json({ code: 0, data: merchant });
  } catch (err) {
    console.error('[updateInfo]', err);
    res.status(500).json({ code: 500, message: '更新失败' });
  }
};

// 获取专属二维码ID（为空则自动生成）
exports.getQrcode = async (req, res) => {
  try {
    let merchant = await Merchant.findById(req.merchantId);
    if (!merchant) {
      return res.json({ code: 404, message: '商家不存在' });
    }

    // 如果 qrcode_id 为空，自动生成
    if (!merchant.qrcode_id) {
      const { v4: uuidv4 } = require('uuid');
      const qrcodeId = uuidv4().replace(/-/g, '');
      await Merchant.updateQrcodeId(req.merchantId, qrcodeId);
      merchant.qrcode_id = qrcodeId;
    }

    // 小程序页面路径
    const pagePath = `pages/client/home?merchantId=${merchant.qrcode_id}`;

    res.json({
      code: 0,
      data: {
        qrcode_id: merchant.qrcode_id,
        page_path: pagePath
      }
    });
  } catch (err) {
    console.error('[getQrcode]', err);
    res.status(500).json({ code: 500, message: '获取失败' });
  }
};

// ==================== 内容管理 ====================

// 发布内容
exports.createPost = async (req, res) => {
  try {
    const { title, lianhong_tag, tag, summary, paid_content, image_url, price, is_presale, post_type } = req.body;

    if (!title || !paid_content) {
      return res.json({ code: 1, message: '标题和付费正文不能为空' });
    }
    if (title.length > 96) {
      return res.json({ code: 1, message: '标题不能超过96个字' });
    }

    const result = await Post.create({
      merchant_id: req.merchantId,
      title, lianhong_tag, tag, summary,
      paid_content, image_url, price, is_presale, post_type
    });

    res.json({ code: 0, message: '发布成功', data: result });
  } catch (err) {
    console.error('[createPost]', err);
    res.status(500).json({ code: 500, message: '发布失败' });
  }
};

// 获取发布列表
exports.getPosts = async (req, res) => {
  try {
    const { post_type, status } = req.query;
    const filters = {};
    if (post_type) filters.post_type = post_type;
    if (status !== undefined) filters.status = Number(status);

    const posts = await Post.findByMerchant(req.merchantId, filters);
    res.json({ code: 0, data: posts });
  } catch (err) {
    console.error('[getPosts]', err);
    res.status(500).json({ code: 500, message: '获取失败' });
  }
};

// 编辑内容
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['title', 'lianhong_tag', 'tag', 'summary', 'paid_content', 'image_url', 'price', 'is_presale', 'post_type'];
    const data = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    });

    const ok = await Post.update(id, req.merchantId, data);
    if (!ok) {
      return res.json({ code: 404, message: '内容不存在' });
    }

    const post = await Post.findById(id, req.merchantId);
    res.json({ code: 0, message: '更新成功', data: post });
  } catch (err) {
    console.error('[updatePost]', err);
    res.status(500).json({ code: 500, message: '更新失败' });
  }
};

// 删除内容
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await Post.delete(id, req.merchantId);
    if (!ok) {
      return res.json({ code: 404, message: '内容不存在' });
    }
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    console.error('[deletePost]', err);
    res.status(500).json({ code: 500, message: '删除失败' });
  }
};

// 上下架切换
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await Post.toggleStatus(id, req.merchantId);
    if (!ok) {
      return res.json({ code: 404, message: '内容不存在' });
    }
    res.json({ code: 0, message: '操作成功' });
  } catch (err) {
    console.error('[toggleStatus]', err);
    res.status(500).json({ code: 500, message: '操作失败' });
  }
};

// 查看订单数据
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findByMerchant(req.merchantId);
    res.json({ code: 0, data: orders });
  } catch (err) {
    console.error('[getOrders]', err);
    res.status(500).json({ code: 500, message: '获取失败' });
  }
};

// 生成商家主页二维码图片
exports.generateQrcodeImage = async (req, res) => {
  try {
    const { qrcode_id, page_path } = req.query;
    if (!qrcode_id || !page_path) {
      return res.status(400).json({ code: 1, message: '参数缺失' });
    }

    const QRCode = require('qrcode');

    const dataUrl = await QRCode.toDataURL(`merchantId=${qrcode_id}`, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    });

    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imgBuffer.length
    });
    res.end(imgBuffer);
  } catch (err) {
    console.error('[generateQrcodeImage]', err);
    res.status(500).json({ code: 500, message: '生成失败' });
  }
};

// 获取单条料单的分享信息（二维码ID + 页面路径）
exports.getPostQrcode = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证这条料单属于当前商家
    const post = await Post.findById(id, req.merchantId);
    if (!post) {
      return res.json({ code: 404, message: '内容不存在' });
    }

    // 获取商家的 qrcode_id（用于客户端识别商家）
    let merchant = await Merchant.findById(req.merchantId);
    if (!merchant.qrcode_id) {
      const { v4: uuidv4 } = require('uuid');
      const qrcodeId = uuidv4().replace(/-/g, '');
      await Merchant.updateQrcodeId(req.merchantId, qrcodeId);
      merchant.qrcode_id = qrcodeId;
    }

    // 单条料单指向详情页
    const pagePath = `pages/client/detail?id=${id}&merchantId=${merchant.qrcode_id}`;

    res.json({
      code: 0,
      data: {
        post_id: id,
        post_title: post.title,
        qrcode_id: merchant.qrcode_id,
        page_path: pagePath
      }
    });
  } catch (err) {
    console.error('[getPostQrcode]', err);
    res.status(500).json({ code: 500, message: '获取失败: ' + err.message });
  }
};

// 生成单条料单的二维码图片
exports.generatePostQrcodeImage = async (req, res) => {
  try {
    const { post_id, post_title, qrcode_id } = req.query;
    if (!post_id || !qrcode_id) {
      return res.status(400).json({ code: 1, message: '参数缺失' });
    }

    const QRCode = require('qrcode');
    const title = decodeURIComponent(post_title || '爆料内容');

    // 二维码内容包含 postId 和 merchantId，扫码后可跳转详情页
    const dataUrl = await QRCode.toDataURL(
      `postId=${post_id}&merchantId=${qrcode_id}`,
      {
        width: 400,
        margin: 2,
        color: { dark: '#E53935', light: '#FFFFFF' }
      }
    );

    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imgBuffer.length
    });
    res.end(imgBuffer);
  } catch (err) {
    console.error('[generatePostQrcodeImage]', err);
    res.status(500).json({ code: 500, message: '生成失败' });
  }
};
