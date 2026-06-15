<template>
  <view class="detail-page">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-wrap">
      <text>加载中...</text>
    </view>

    <template v-else-if="post">
      <!-- 内容头部 -->
      <view class="detail-header">
        <text class="detail-title">{{ post.title }}</text>
        <view class="detail-tags">
          <text v-if="post.lianhong_tag" class="tag red">{{ post.lianhong_tag }}</text>
          <text v-if="post.tag" class="tag gray">{{ post.tag }}</text>
          <text class="tag" :class="post.is_today ? 'orange' : 'green'">
            {{ post.is_today ? '今日内容' : '往期免费' }}
          </text>
        </view>
        <text v-if="post.summary" class="detail-summary">{{ post.summary }}</text>
      </view>

      <!-- 配图 -->
      <image
        v-if="post.image_url"
        :src="post.image_url"
        mode="widthFix"
        class="detail-image"
      />

      <!-- 付费内容区域 -->
      <view class="content-area">
        <!-- 往期或已支付 → 全文展示 -->
        <view v-if="!post.is_today || post.is_paid" class="full-content">
          <text class="content-text">{{ post.paid_content }}</text>
        </view>

        <!-- 今日未支付 → 遮罩 + 解锁按钮 -->
        <view v-else class="locked-content">
          <view class="lock-mask">
            <text class="lock-icon">🔒</text>
            <text class="lock-text">付费内容，支付后解锁</text>
            <text class="lock-price">¥{{ post.price }}</text>
            <view class="unlock-btn" @click="showPayModal = true">
              立即支付解锁
            </view>
          </view>
        </view>
      </view>

      <!-- 底部发布日期 -->
      <view v-if="post.created_at" class="detail-footer">
        <text>发布于 {{ post.created_at }}</text>
      </view>
    </template>

    <!-- 内容不存在 -->
    <view v-else class="empty-state">
      <text>内容不存在</text>
    </view>

    <!-- 支付弹窗 -->
    <view v-if="showPayModal" class="pay-modal-mask" @click="showPayModal = false">
      <view class="pay-modal" @click.stop>
        <text class="pay-title">确认支付</text>
        <text class="pay-amount">¥{{ post?.price || '9.90' }}</text>
        <text class="pay-subtitle">付费解锁全文内容</text>
        <view class="pay-confirm-btn" @click="handlePay">
          确认支付
        </view>
        <view class="pay-cancel" @click="showPayModal = false">
          取消
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import api from '../../utils/api';

const loading = ref(true);
const post = ref(null);
const showPayModal = ref(false);
let postId = '';
let merchantId = '';

onLoad((options) => {
  postId = options.id;
  merchantId = options.merchantId || '';
  loadDetail();
});

function loadDetail() {
  loading.value = true;
  // 尝试获取 openid（如果有存储）
  const openid = uni.getStorageSync('openid') || '';

  api.getPostDetail(postId, openid).then(res => {
    loading.value = false;
    if (res.code === 0) {
      post.value = res.data;
    } else {
      uni.showToast({ title: res.message, icon: 'none' });
    }
  }).catch(() => {
    loading.value = false;
  });
}

// 发起微信支付
function handlePay() {
  showPayModal.value = false;
  uni.showLoading({ title: '支付中...' });

  // 微信登录获取 code
  uni.login({
    provider: 'weixin',
    success: (loginRes) => {
      const code = loginRes.code;

      api.createPay({
        post_id: postId,
        code
      }).then(payRes => {
        uni.hideLoading();
        if (payRes.code === 0) {
          const payData = payRes.data;

          // 如果已购买直接刷新
          if (payData.paid) {
            uni.showToast({ title: '已购买', icon: 'success' });
            loadDetail();
            return;
          }

          // 调起微信支付
          uni.requestPayment({
            provider: 'wxpay',
            timeStamp: payData.timeStamp,
            nonceStr: payData.nonceStr,
            package: payData.package,
            signType: payData.signType || 'MD5',
            paySign: payData.paySign,
            success: () => {
              uni.showToast({ title: '支付成功', icon: 'success' });
              // 支付成功后刷新内容
              setTimeout(() => loadDetail(), 500);
            },
            fail: (err) => {
              console.error('支付失败', err);
              uni.showToast({ title: '支付取消或失败', icon: 'none' });
            }
          });
        } else {
          uni.showToast({ title: payRes.message, icon: 'none' });
        }
      }).catch(() => {
        uni.hideLoading();
        uni.showToast({ title: '支付请求失败', icon: 'none' });
      });
    },
    fail: () => {
      uni.hideLoading();
      uni.showToast({ title: '微信授权失败', icon: 'none' });
    }
  });
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.loading-wrap {
  text-align: center;
  padding-top: 200rpx;
  color: #999;
}

.detail-header {
  background: #FFFFFF;
  padding: 32rpx 24rpx;

  .detail-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
  }

  .detail-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-top: 20rpx;

    .tag {
      font-size: 22rpx;
      padding: 4rpx 16rpx;
      border-radius: 4rpx;

      &.red {
        background: #FFEBEE;
        color: #E53935;
      }
      &.gray {
        background: #F5F5F5;
        color: #666;
      }
      &.orange {
        background: #FFF3E0;
        color: #E65100;
      }
      &.green {
        background: #E8F5E9;
        color: #2E7D32;
      }
    }
  }

  .detail-summary {
    display: block;
    font-size: 28rpx;
    color: #666;
    margin-top: 20rpx;
    line-height: 1.6;
  }
}

.detail-image {
  width: 100%;
  display: block;
}

.content-area {
  padding: 24rpx;
}

.full-content {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;

  .content-text {
    font-size: 30rpx;
    color: #333;
    line-height: 1.8;
    white-space: pre-wrap;
  }
}

.locked-content {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  min-height: 400rpx;

  .lock-mask {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80rpx 40rpx;

    .lock-icon {
      font-size: 80rpx;
      margin-bottom: 24rpx;
    }

    .lock-text {
      font-size: 28rpx;
      color: #666;
    }

    .lock-price {
      font-size: 52rpx;
      font-weight: bold;
      color: #E53935;
      margin: 20rpx 0;
    }

    .unlock-btn {
      width: 100%;
      height: 88rpx;
      background: #E53935;
      color: #FFFFFF;
      border-radius: 12rpx;
      font-size: 32rpx;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 24rpx;

      &:active {
        opacity: 0.85;
      }
    }
  }
}

.detail-footer {
  text-align: center;
  padding: 24rpx;
  font-size: 24rpx;
  color: #999;
}

/* 支付弹窗 */
.pay-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.pay-modal {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 48rpx 40rpx;
  width: 560rpx;
  text-align: center;

  .pay-title {
    font-size: 32rpx;
    color: #333;
    font-weight: 500;
  }

  .pay-amount {
    display: block;
    font-size: 56rpx;
    font-weight: bold;
    color: #E53935;
    margin: 24rpx 0 12rpx;
  }

  .pay-subtitle {
    font-size: 24rpx;
    color: #999;
  }

  .pay-confirm-btn {
    width: 100%;
    height: 88rpx;
    background: #E53935;
    color: #FFFFFF;
    border-radius: 12rpx;
    font-size: 32rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 32rpx;

    &:active {
      opacity: 0.85;
    }
  }

  .pay-cancel {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #999;
    padding: 12rpx;
  }
}

.empty-state {
  text-align: center;
  padding-top: 200rpx;
  color: #999;
}
</style>
