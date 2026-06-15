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
        <text class="label">手机号</text>
        <input
          class="input"
          v-model="phone"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
          placeholder-class="placeholder"
        />
      </view>

      <view class="form-item">
        <text class="label">验证码</text>
        <view class="code-row">
          <input
            class="input code-input"
            v-model="code"
            type="number"
            maxlength="4"
            placeholder="请输入验证码"
            placeholder-class="placeholder"
          />
          <view
            class="code-btn"
            :class="{ disabled: countdown > 0 }"
            @click="sendCode"
          >
            <text v-if="countdown > 0">{{ countdown }}s后重发</text>
            <text v-else>获取验证码</text>
          </view>
        </view>
      </view>

      <view class="login-btn" @click="handleLogin">
        <text>登录</text>
      </view>

      <view class="tip">
        <text>首次登录自动注册账号</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import api from '../../utils/api';

const phone = ref('');
const code = ref('');
const countdown = ref(0);

// 发送验证码
function sendCode() {
  if (countdown.value > 0) return;
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return;
  }

  api.sendCode(phone.value).then(res => {
    if (res.code === 0) {
      uni.showToast({ title: '验证码已发送', icon: 'success' });
      countdown.value = 60;
      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) clearInterval(timer);
      }, 1000);
    } else {
      uni.showToast({ title: res.message, icon: 'none' });
    }
  });
}

// 登录
function handleLogin() {
  if (!phone.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' });
    return;
  }
  if (!code.value) {
    uni.showToast({ title: '请输入验证码', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '登录中...' });
  api.login(phone.value, code.value).then(res => {
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

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #E53935 0%, #C62828 100%);
  padding: 80rpx 40rpx;
}

.header {
  text-align: center;
  margin-bottom: 80rpx;

  .logo-area {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20rpx;

    .logo-icon {
      font-size: 60rpx;
      margin-right: 16rpx;
    }

    .logo-title {
      font-size: 52rpx;
      font-weight: bold;
      color: #FFFFFF;
    }
  }

  .subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.form-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 60rpx 40rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

.form-item {
  margin-bottom: 40rpx;

  .label {
    display: block;
    font-size: 28rpx;
    color: #333333;
    margin-bottom: 16rpx;
    font-weight: 500;
  }

  .input {
    width: 100%;
    height: 88rpx;
    background: #F5F5F5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 30rpx;
    box-sizing: border-box;
  }

  .code-row {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .code-input {
      flex: 1;
    }

    .code-btn {
      width: 200rpx;
      height: 88rpx;
      background: #E53935;
      color: #FFFFFF;
      border-radius: 12rpx;
      font-size: 26rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.disabled {
        background: #CCCCCC;
      }
    }
  }
}

.login-btn {
  height: 96rpx;
  background: #E53935;
  color: #FFFFFF;
  border-radius: 12rpx;
  font-size: 34rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;

  &:active {
    opacity: 0.85;
  }
}

.tip {
  text-align: center;
  margin-top: 24rpx;
  font-size: 24rpx;
  color: #999999;
}

.placeholder {
  color: #CCCCCC;
  font-size: 28rpx;
}
</style>
