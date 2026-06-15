<template>
  <view class="orders-page">
    <!-- 汇总区域 -->
    <view class="summary-card">
      <view class="summary-item">
        <text class="summary-label">总收入</text>
        <text class="summary-value">¥{{ totalIncome.toFixed(2) }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">订单数</text>
        <text class="summary-value">{{ orders.length }}</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <view v-if="orders.length > 0" class="list-wrap">
      <view
        v-for="item in orders"
        :key="item.id"
        class="order-card"
      >
        <view class="order-header">
          <text class="order-title">{{ item.post_title || '内容已删除' }}</text>
          <text class="order-amount">¥{{ item.amount }}</text>
        </view>
        <view class="order-info">
          <text class="order-time">{{ item.created_at }}</text>
          <text class="order-status" :class="item.pay_status === 1 ? 'paid' : 'unpaid'">
            {{ item.pay_status === 1 ? '已支付' : '未支付' }}
          </text>
        </view>
        <view v-if="item.transaction_id" class="order-trade">
          <text>交易单号：{{ item.transaction_id }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无订单数据</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onShow } from 'vue';
import api from '../../utils/api';

const orders = ref([]);

onShow(() => {
  loadOrders();
});

function loadOrders() {
  api.getOrders().then(res => {
    if (res.code === 0) {
      orders.value = res.data || [];
    }
  });
}

const totalIncome = computed(() => {
  return orders.value
    .filter(o => o.pay_status === 1)
    .reduce((sum, o) => sum + Number(o.amount), 0);
});
</script>

<style lang="scss" scoped>
.orders-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.summary-card {
  background: linear-gradient(135deg, #E53935, #C62828);
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 40rpx;
  display: flex;
  justify-content: space-around;

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .summary-label {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 12rpx;
  }

  .summary-value {
    font-size: 44rpx;
    font-weight: bold;
    color: #FFFFFF;
  }
}

.list-wrap {
  padding: 0 24rpx;
}

.order-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .order-title {
      flex: 1;
      font-size: 30rpx;
      color: #333;
      font-weight: 500;
    }

    .order-amount {
      font-size: 36rpx;
      color: #E53935;
      font-weight: bold;
    }
  }

  .order-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16rpx;

    .order-time {
      font-size: 24rpx;
      color: #999;
    }

    .order-status {
      font-size: 22rpx;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;

      &.paid {
        background: #E8F5E9;
        color: #4CAF50;
      }
      &.unpaid {
        background: #FFF3E0;
        color: #FF9800;
      }
    }
  }

  .order-trade {
    margin-top: 12rpx;
    font-size: 22rpx;
    color: #BBB;
  }
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
