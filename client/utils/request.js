// 基础请求地址
const BASE_URL = 'http://39.108.235.72:3333';

// 请求封装
function request({ url, method = 'GET', data = {}, header = {} }) {
  return new Promise((resolve, reject) => {
    // 自动带 token
    const token = uni.getStorageSync('token');
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }

    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        if (res.statusCode === 401) {
          uni.removeStorageSync('token');
          uni.reLaunch({ url: '/pages/merchant/login' });
          reject(new Error('未登录'));
          return;
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error('请求失败'));
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常', icon: 'none' });
        reject(err);
      }
    });
  });
}

export default {
  get(url, data) {
    return request({ url, method: 'GET', data });
  },
  post(url, data) {
    return request({ url, method: 'POST', data });
  },
  put(url, data) {
    return request({ url, method: 'PUT', data });
  },
  delete(url, data) {
    return request({ url, method: 'DELETE', data });
  },
  upload(filePath) {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync('token');
      uni.uploadFile({
        url: BASE_URL + '/api/upload',
        filePath,
        name: 'file',
        header: {
          Authorization: `Bearer ${token}`
        },
        success: (res) => {
          if (res.statusCode === 401) {
            uni.removeStorageSync('token');
            uni.reLaunch({ url: '/pages/merchant/login' });
            reject(new Error('未登录'));
            return;
          }
          try {
            const data = JSON.parse(res.data);
            resolve(data);
          } catch (e) {
            reject(new Error('解析失败'));
          }
        },
        fail: (err) => {
          uni.showToast({ title: '上传失败', icon: 'none' });
          reject(err);
        }
      });
    });
  }
};
