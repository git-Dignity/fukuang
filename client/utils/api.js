import request from './request';

export default {
  // ==================== 商家端 ====================

  // 账号密码登录
  login(username, password) {
    return request.post('/api/merchant/login', { username, password });
  },

  // 获取商家信息
  getMerchantInfo() {
    return request.get('/api/merchant/info');
  },

  // 更新商家信息
  updateMerchantInfo(data) {
    return request.put('/api/merchant/info', data);
  },

  // 获取二维码信息（商家主页）
  getQrcode() {
    return request.get('/api/merchant/qrcode');
  },

  // 获取单条料单分享信息
  getPostQrcode(postId) {
    return request.get(`/api/merchant/posts/${postId}/qrcode`);
  },

  // 发布内容
  createPost(data) {
    return request.post('/api/merchant/posts', data);
  },

  // 获取发布列表
  getPosts(params = {}) {
    return request.get('/api/merchant/posts', params);
  },

  // 编辑内容
  updatePost(id, data) {
    return request.put(`/api/merchant/posts/${id}`, data);
  },

  // 删除内容
  deletePost(id) {
    return request.delete(`/api/merchant/posts/${id}`);
  },

  // 上下架切换
  togglePostStatus(id) {
    return request.put(`/api/merchant/posts/${id}/status`);
  },

  // 获取订单数据
  getOrders() {
    return request.get('/api/merchant/orders');
  },

  // 上传图片
  uploadImage(filePath) {
    return request.upload(filePath);
  },

  // ==================== 客户端 ====================

  // 获取商家主页
  getMerchantHome(merchantId) {
    return request.get(`/api/client/home/${merchantId}`);
  },

  // 获取内容详情
  getPostDetail(id, openid) {
    return request.get(`/api/client/post/${id}`, openid ? { openid } : {});
  },

  // 发起支付
  createPay(data) {
    return request.post('/api/client/pay', data);
  }
};
