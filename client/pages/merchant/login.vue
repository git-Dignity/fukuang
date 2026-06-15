<template>
  <view class="login-page">
    <!-- 头部区域 -->
    <view class="header">
      <view class="logo-area">
        <text class="logo-icon">⚡</text>
        <text class="logo-title">爆料后台</text>
      </view>
      <text class="subtitle">商家登录管理</text>
    </view>

    <!-- 表单区域 -->
    <view class="form-card">
      <view class="form-item">
        <text class="label">用户名</text>
        <input
          class="input"
          v-model="username"
          placeholder="请输入用户名"
          placeholder-class="placeholder"
        />
      </view>

      <view class="form-item">
        <text class="label">密码</text>
        <input
          class="input"
          v-model="password"
          type="text"
          password
          placeholder="请输入密码"
          placeholder-class="placeholder"
        />
      </view>

      <view class="login-btn" @click="handleLogin">
        <text>登录</text>
      </view>

      <view class="tip">
        <text>管理员账户: admin / abc1234#</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import api from '../../utils/api';

const username = ref('');
const password = ref('');

// 登录
function handleLogin() {
  if (!username.value) {
    uni.showToast({ title: '请输入用户名', icon: 'none' });
    return;
  }
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '登录中...' });
  api.login(username.value, password.value).then(res => {
    uni.hideLoading();
    if (res.code === 0) {
      // 保存 token
      uni.setStorageSync('token', res.data.token);
      uni.setStorageSync('merchantInfo', JSON.stringify(res.data.merchant));
      uni.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/merchant/manage' });
      }, 500);
    } else {
      uni.showToast({ title: res.message, icon: 'none' });
    }
  }).catch(() => {
    uni.hideLoading();
    uni.showToast({ title: '登录失败', icon: 'none' });
  });
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #E53935 0%, #C62828 100%);
  padding: 80rpx 40rpx;
}

.header { text-align: center; margin-bottom: 80rpx; }

.header .logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.header .logo-area .logo-icon { font-size: 60rpx; margin-right: 16rpx; }
.header .logo-area .logo-title { font-size: 52rpx; font-weight: bold; color: #FFFFFF; }
.header .subtitle { font-size: 28rpx; color: rgba(255, 255, 255, 0.8); }

.form-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 60rpx 40rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

.form-item { margin-bottom: 40rpx; }
.form-item .label { display: block; font-size: 28rpx; color: #333333; margin-bottom: 16rpx; font-weight: 500; }
.form-item .input {
  width: 100%; height: 88rpx; background: #F5F5F5;
  border-radius: 12rpx; padding: 0 24rpx; font-size: 30rpx; box-sizing: border-box;
}

.login-btn {
  height: 96rpx; background: #E53935; color: #FFFFFF; border-radius: 12rpx;
  font-size: 34rpx; font-weight: bold; display: flex; align-items: center;
  justify-content: center; margin-top: 20rpx;
}
.login-btn:active { opacity: 0.85; }

.tip { text-align: center; margin-top: 24rpx; font-size: 24rpx; color: #999999; }
.placeholder { color: #CCCCCC; font-size: 28rpx; }
</style>
