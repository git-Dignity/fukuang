<template>
  <view class="manage-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜索内容"
          placeholder-class="placeholder"
        />
      </view>
    </view>

    <!-- 分类 Tab -->
    <scroll-view scroll-x class="tab-scroll">
      <view class="tab-wrap">
        <view
          v-for="tab in categoryTabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: activeCategory === tab.value }"
          @click="switchCategory(tab.value)"
        >
          {{ tab.label }}
        </view>
      </view>
    </scroll-view>

    <!-- 内容列表 -->
    <view v-if="filteredList.length > 0" class="list-wrap">
      <view
        v-for="item in filteredList"
        :key="item.id"
        class="post-card"
      >
        <view class="card-header">
          <view class="card-title-row">
            <text class="card-title">{{ item.title }}</text>
            <text class="card-status" :class="item.status === 1 ? 'on' : 'off'">
              {{ item.status === 1 ? '上架' : '下架' }}
            </text>
          </view>
          <view class="card-tags">
            <text v-if="item.lianhong_tag" class="tag red">{{ item.lianhong_tag }}</text>
            <text v-if="item.tag" class="tag gray">{{ item.tag }}</text>
            <text class="tag orange">{{ getTypeLabel(item.post_type) }}</text>
          </view>
        </view>

        <view v-if="item.summary" class="card-summary">{{ item.summary }}</view>

        <view class="card-footer">
          <text class="card-date">{{ item.created_at }}</text>
          <view class="card-actions">
            <view class="action-btn gray" @click="toggleStatus(item)">{{ item.status === 1 ? '下架' : '上架' }}</view>
            <view class="action-btn gray" @click="goEdit(item.id)">编辑</view>
            <view class="action-btn red" @click="deletePost(item.id)">删除</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">✉️</text>
      <text class="empty-text">暂无数据</text>
    </view>

    <!-- 新建按钮 -->
    <view class="bottom-fixed">
      <view class="add-btn" @click="goPublish">
        <text class="add-icon">+</text>
        <text>新建爆料</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onShow } from 'vue';
import api from '../../utils/api';

const keyword = ref('');
const activeCategory = ref('all');
const postList = ref([]);

const categoryTabs = [
  { label: '全部', value: 'all' },
  { label: '包时套餐', value: 'package' },
  { label: '不中退料', value: 'norefund' },
  { label: '预售料', value: 'presale' }
];

onShow(() => {
  loadPosts();
});

// 加载列表
function loadPosts() {
  const params = {};
  if (activeCategory.value !== 'all') {
    params.post_type = activeCategory.value;
  }
  api.getPosts(params).then(res => {
    if (res.code === 0) {
      postList.value = res.data || [];
    }
  });
}

// 切换分类
function switchCategory(value) {
  activeCategory.value = value;
  loadPosts();
}

// 过滤列表
const filteredList = computed(() => {
  if (!keyword.value.trim()) return postList.value;
  const kw = keyword.value.toLowerCase();
  return postList.value.filter(item =>
    item.title.toLowerCase().includes(kw)
  );
});

// 类型标签
function getTypeLabel(type) {
  const map = {
    normal: '常规',
    package: '包时套餐',
    norefund: '不中退',
    presale: '预售'
  };
  return map[type] || type;
}

// 跳转编辑
function goEdit(id) {
  uni.navigateTo({ url: `/pages/merchant/edit?id=${id}` });
}

// 跳转发布
function goPublish() {
  uni.navigateTo({ url: '/pages/merchant/publish' });
}

// 上下架切换
function toggleStatus(item) {
  api.togglePostStatus(item.id).then(res => {
    if (res.code === 0) {
      uni.showToast({ title: '操作成功', icon: 'success' });
      loadPosts();
    } else {
      uni.showToast({ title: res.message, icon: 'none' });
    }
  });
}

// 删除
function deletePost(id) {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确认删除？',
    success: (res) => {
      if (res.confirm) {
        api.deletePost(id).then(data => {
          if (data.code === 0) {
            uni.showToast({ title: '已删除', icon: 'success' });
            loadPosts();
          } else {
            uni.showToast({ title: data.message, icon: 'none' });
          }
        });
      }
    }
  });
}
</script>

<style lang="scss" scoped>
.manage-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 140rpx;
}

.search-bar {
  padding: 20rpx 24rpx;
  background: #FFFFFF;

  .search-input-wrap {
    display: flex;
    align-items: center;
    background: #F5F5F5;
    border-radius: 16rpx;
    padding: 0 24rpx;

    .search-icon {
      font-size: 28rpx;
      margin-right: 12rpx;
    }

    .search-input {
      flex: 1;
      height: 72rpx;
      font-size: 28rpx;
    }
  }
}

.tab-scroll {
  background: #FFFFFF;
  white-space: nowrap;

  .tab-wrap {
    display: inline-flex;
    padding: 0 24rpx;

    .tab-item {
      padding: 24rpx 28rpx;
      font-size: 28rpx;
      color: #666666;
      display: inline-block;

      &.active {
        color: #E53935;
        font-weight: bold;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          bottom: 4rpx;
          left: 28rpx;
          right: 28rpx;
          height: 4rpx;
          background: #E53935;
          border-radius: 2rpx;
        }
      }
    }
  }
}

.list-wrap {
  padding: 24rpx;
}

.post-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;

  .card-header {
    .card-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .card-title {
        flex: 1;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .card-status {
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;

        &.on {
          background: #E8F5E9;
          color: #4CAF50;
        }
        &.off {
          background: #FFF3E0;
          color: #FF9800;
        }
      }
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      margin-top: 16rpx;

      .tag {
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;

        &.red {
          background: #FFEBEE;
          color: #E53935;
        }
        &.gray {
          background: #F5F5F5;
          color: #666666;
        }
        &.orange {
          background: #FFF3E0;
          color: #E65100;
        }
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

    .card-actions {
      display: flex;
      gap: 16rpx;

      .action-btn {
        font-size: 24rpx;
        padding: 8rpx 20rpx;
        border-radius: 6rpx;

        &.gray {
          background: #F5F5F5;
          color: #666;
        }
        &.red {
          background: #FFEBEE;
          color: #E53935;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

.bottom-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 40rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #FFFFFF;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.add-btn {
  height: 96rpx;
  background: #E53935;
  color: #FFFFFF;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;

  .add-icon {
    font-size: 40rpx;
  }

  &:active {
    opacity: 0.85;
  }
}

.placeholder {
  color: #CCCCCC;
  font-size: 28rpx;
}
</style>
