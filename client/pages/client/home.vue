<template>
  <view class="home-page">
    <!-- 商家横幅 -->
    <view class="banner">
      <view class="banner-bg">
        <text class="banner-name">{{ merchant.name || '商家主页' }}</text>
        <text v-if="merchant.intro" class="banner-intro">{{ merchant.intro }}</text>
        <view class="banner-tip">
          <text>📱 扫码直达，往期全部免费查看</text>
        </view>
      </view>
    </view>

    <!-- 今日内容 -->
    <view v-if="todayPosts.length > 0" class="section">
      <view class="section-header">
        <text class="section-title">今日内容</text>
        <text class="section-badge today">需付费</text>
      </view>

      <view
        v-for="item in todayPosts"
        :key="item.id"
        class="post-card today-card"
        @click="goDetail(item)"
      >
        <view class="card-tag-row">
          <text class="card-tag today-tag">今日付费解锁</text>
        </view>
        <text class="card-title">{{ item.title }}</text>
        <view class="card-tags">
          <text v-if="item.lianhong_tag" class="tag red">{{ item.lianhong_tag }}</text>
          <text v-if="item.tag" class="tag gray">{{ item.tag }}</text>
        </view>
        <text v-if="item.summary" class="card-summary">{{ item.summary }}</text>
        <view class="card-footer">
          <text class="card-date">{{ item.created_at }}</text>
          <view class="pay-btn">
            支付 ¥{{ item.price }} 查看全文
          </view>
        </view>
      </view>
    </view>

    <!-- 往期内容 -->
    <view v-if="pastPosts.length > 0" class="section">
      <view class="section-header">
        <text class="section-title">往期内容</text>
        <text class="section-badge free">免费</text>
      </view>

      <view
        v-for="item in pastPosts"
        :key="item.id"
        class="post-card free-card"
        @click="goDetail(item)"
      >
        <view class="card-tag-row">
          <text class="card-tag free-tag">往期免费</text>
        </view>
        <text class="card-title">{{ item.title }}</text>
        <view class="card-tags">
          <text v-if="item.lianhong_tag" class="tag red">{{ item.lianhong_tag }}</text>
          <text v-if="item.tag" class="tag gray">{{ item.tag }}</text>
        </view>
        <text v-if="item.summary" class="card-summary">{{ item.summary }}</text>
        <view class="card-footer">
          <text class="card-date">{{ item.created_at }}</text>
          <view class="free-btn">
            点击直接查看全文
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="todayPosts.length === 0 && pastPosts.length === 0" class="empty-state">
      <text class="empty-icon">📭</text>
      <text class="empty-text">该商家暂未发布内容</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import api from '../../utils/api';

const merchant = ref({});
const todayPosts = ref([]);
const pastPosts = ref([]);
let currentMerchantId = '';

onLoad((options) => {
  currentMerchantId = options.merchantId || '';
  if (currentMerchantId) {
    loadHome();
  } else {
    uni.showToast({ title: '缺少商家ID', icon: 'none' });
  }
});

function loadHome() {
  api.getMerchantHome(currentMerchantId).then(res => {
    if (res.code === 0) {
      merchant.value = res.data.merchant;
      todayPosts.value = res.data.today || [];
      pastPosts.value = res.data.past || [];
    } else {
      uni.showToast({ title: res.message, icon: 'none' });
    }
  });
}

function goDetail(item) {
  uni.navigateTo({ url: `/pages/client/detail?id=${item.id}&merchantId=${currentMerchantId}` });
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.banner {
  .banner-bg {
    background: linear-gradient(135deg, #E53935, #C62828);
    padding: 40rpx 32rpx 36rpx;

    .banner-name {
      font-size: 44rpx;
      font-weight: bold;
      color: #FFFFFF;
      display: block;
    }

    .banner-intro {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.85);
      margin-top: 12rpx;
      display: block;
    }

    .banner-tip {
      margin-top: 20rpx;
      background: rgba(255, 255, 255, 0.2);
      padding: 12rpx 20rpx;
      border-radius: 8rpx;
      display: inline-block;

      text {
        font-size: 24rpx;
        color: #FFFFFF;
      }
    }
  }
}

.section {
  padding: 0 24rpx;
  margin-top: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .section-badge {
    margin-left: 16rpx;
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;

    &.today {
      background: #FFF3E0;
      color: #E65100;
    }
    &.free {
      background: #E8F5E9;
      color: #2E7D32;
    }
  }
}

.post-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;

  &.today-card {
    border-left: 6rpx solid #FF9800;
  }
  &.free-card {
    border-left: 6rpx solid #4CAF50;
  }
}

.card-tag-row {
  margin-bottom: 12rpx;

  .card-tag {
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    border-radius: 4rpx;
    font-weight: bold;

    &.today-tag {
      background: #FFF3E0;
      color: #E65100;
    }
    &.free-tag {
      background: #E8F5E9;
      color: #2E7D32;
    }
  }
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;

  .tag {
    font-size: 22rpx;
    padding: 4rpx 12rpx;
    border-radius: 4rpx;

    &.red {
      background: #FFEBEE;
      color: #E53935;
    }
    &.gray {
      background: #F5F5F5;
      color: #666;
    }
  }
}

.card-summary {
  font-size: 26rpx;
  color: #666;
  margin-top: 16rpx;
  line-height: 1.6;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #F0F0F0;

  .card-date {
    font-size: 24rpx;
    color: #999;
  }
}

.pay-btn {
  background: #E53935;
  color: #FFFFFF;
  font-size: 24rpx;
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  font-weight: 500;
}

.free-btn {
  border: 2rpx solid #4CAF50;
  color: #4CAF50;
  font-size: 24rpx;
  padding: 10rpx 24rpx;
  border-radius: 8rpx;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
