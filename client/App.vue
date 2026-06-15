<template>
  <view>
    <router-view />
  </view>
</template>

<script setup>
import { onLaunch } from '@dcloudio/uni-app';

onLaunch(() => {
  console.log('[App] 启动');
});
</script>

<style>
/* 全局样式 */
page {
  background-color: #F5F5F5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 主题色变量 */
view {
  box-sizing: border-box;
}

/* 通用红色主题 */
.text-primary {
  color: #E53935;
}
.text-green {
  color: #4CAF50;
}
.text-orange {
  color: #FF9800;
}
.text-gray {
  color: #999999;
}

/* 通用按钮 */
.btn-primary {
  background-color: #E53935;
  color: #FFFFFF;
  border-radius: 8rpx;
  padding: 24rpx 0;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
}

/* 卡片 */
.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}
</style>
