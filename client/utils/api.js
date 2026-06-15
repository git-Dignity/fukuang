import request from './request';

export default {
  // ==================== 商家端 ====================

  // 发送验证码
  sendCode(phone) {
    return request.post('/api/merchant/send-code', { phone });
  },

  // 手机号登录
  login(phone, code) {
    return request.post('/api/merchant/login', { phone, code });
  },

  // 获取商家信息
  getMerchantInfo() {
    return request.get('/api/merchant/info');
  },

  // 更新商家信息
  updateMerchantInfo(data) {
    return request.put('/api/merchant/info', data);
  },

  // 获取二维码信息
  getQrcode() {
    return request.get('/api/merchant/qrcode');
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
