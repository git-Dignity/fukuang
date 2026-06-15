const dayjs = require('dayjs');
const Merchant = require('../models/Merchant');
const Post = require('../models/Post');
const Order = require('../models/Order');

// 客户端：获取商家主页内容列表
exports.getHome = async (req, res) => {
  try {
    const { merchantId } = req.params;

    // 通过 qrcode_id 查找商家
    const merchant = await Merchant.findByQrcodeId(merchantId);
    if (!merchant) {
      return res.json({ code: 404, message: '商家不存在' });
    }

    // 获取商家所有上架内容
    const posts = await Post.findByMerchantForClient(merchant.id);

    // 分组：今日 vs 往期
    const todayPosts = posts.filter(p => p.is_today === 1);
    const pastPosts = posts.filter(p => p.is_today === 0);

    res.json({
      code: 0,
      data: {
        merchant: {
          id: merchant.id,
          name: merchant.name,
          avatar: merchant.avatar,
          intro: merchant.intro
        },
        today: todayPosts,   // 今日内容（需付费）
        past: pastPosts      // 往期内容（免费）
      }
    });
  } catch (err) {
    console.error('[getHome]', err);
    res.status(500).json({ code: 500, message: '获取失败' });
  }
};

// 客户端：获取内容详情
exports.getPostDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { openid } = req.query; // 买家 openid（非必传）

    const post = await Post.findByIdForClient(id);
    if (!post) {
      return res.json({ code: 404, message: '内容不存在或已下架' });
    }

    const isToday = post.is_today === 1;
    let isPaid = false;

    // 如果是今日内容，检查是否已购买
    if (isToday && openid) {
      const purchased = await Order.hasPurchased(id, openid);
      isPaid = purchased;
    }

    // 构建返回数据
    const result = {
      id: post.id,
      title: post.title,
      lianhong_tag: post.lianhong_tag,
      tag: post.tag,
      summary: post.summary,
      image_url: post.image_url,
      price: post.price,
      is_today: isToday,
      is_paid: isPaid,
      created_at: post.created_at
    };

    // 往期内容或已购买的今日内容 → 返回全文
    if (!isToday || isPaid) {
      result.paid_content = post.paid_content;
    }
    // 今日未支付 → 不返回付费内容

    res.json({ code: 0, data: result });
  } catch (err) {
    console.error('[getPostDetail]', err);
    res.status(500).json({ code: 500, message: '获取失败' });
  }
};
