<template>
  <view class="manage-page">
    <!-- 搜索栏 + 主页分享 -->
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
      <view class="share-btn" @click="openHomeQrcode">
        <text class="share-icon">📱</text>
        <text>分享主页</text>
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
            <view class="action-btn share-btn-small" @click="openPostQrcode(item)">
              <text class="share-icon-small">⤴</text>分享
            </view>
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

    <!-- 二维码分享弹窗（复用：主页/单条） -->
    <view v-if="showQrcode" class="qrcode-modal-mask" @click="showQrcode = false">
      <view class="qrcode-modal" @click.stop>
        <text class="qrcode-title">{{ qrcodeMode === 'post' ? '分享料单' : '分享料单主页' }}</text>
        <text class="qrcode-desc">{{ qrcodeMode === 'post' ? qrcodePostTitle : '让客户扫码查看你的料单' }}</text>

        <!-- 二维码图片 -->
        <view class="qrcode-wrap">
          <image
            v-if="qrcodeUrl"
            :src="qrcodeUrl"
            mode="aspectFit"
            class="qrcode-img"
          />
          <view v-else class="qrcode-loading">
            <text>生成中...</text>
          </view>
        </view>

        <text class="qrcode-tip">微信扫一扫{{ qrcodeMode === 'post' ? ' 查看详情' : ' 查看料单' }}</text>

        <view class="qrcode-actions">
          <view class="qrcode-save-btn" @click="saveQrcode">
            保存二维码到相册
          </view>
          <view class="qrcode-debug-btn" @click="simulateScan">
            🔗 模拟扫码进入
          </view>
          <view class="qrcode-close" @click="showQrcode = false">
            关闭
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import api from '../../utils/api';

const keyword = ref('');
const activeCategory = ref('all');
const postList = ref([]);
const showQrcode = ref(false);
const qrcodeUrl = ref('');
const qrcodeMode = ref('home'); // 'home' | 'post'
const qrcodePostTitle = ref('');
const qrcodeData = ref({ qrcode_id: '', post_id: '', page_path: '' }); // 保存二维码相关数据用于模拟跳转

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

// ====== 分享功能 ======

// 打开主页二维码弹窗
function openHomeQrcode() {
  showQrcode.value = true;
  qrcodeMode.value = 'home';
  qrcodeUrl.value = '';

  api.getQrcode().then(res => {
    if (res.code === 0) {
      qrcodeData.value = {
        qrcode_id: res.data.qrcode_id,
        post_id: '',
        page_path: res.data.page_path
      };
      const apiUrl = getBaseUrl() + `/api/merchant/qrcode-image?qrcode_id=${res.data.qrcode_id}&page_path=${encodeURIComponent(res.data.page_path)}`;
      qrcodeUrl.value = apiUrl;
    } else {
      uni.showToast({ title: res.message, icon: 'none' });
      showQrcode.value = false;
    }
  }).catch(() => {
    uni.showToast({ title: '获取失败', icon: 'none' });
    showQrcode.value = false;
  });
}

// 打开单条料单二维码弹窗
function openPostQrcode(item) {
  showQrcode.value = true;
  qrcodeMode.value = 'post';
  qrcodePostTitle.value = item.title;
  qrcodeUrl.value = '';

  api.getPostQrcode(item.id).then(res => {
    if (res.code === 0) {
      const d = res.data;
      qrcodeData.value = {
        qrcode_id: d.qrcode_id,
        post_id: d.post_id,
        page_path: d.page_path
      };
      const apiUrl = getBaseUrl() + `/api/merchant/post-qrcode-image?post_id=${d.post_id}&post_title=${encodeURIComponent(d.post_title)}&qrcode_id=${d.qrcode_id}`;
      qrcodeUrl.value = apiUrl;
    } else {
      uni.showToast({ title: res.message, icon: 'none' });
      showQrcode.value = false;
    }
  }).catch(() => {
    uni.showToast({ title: '获取失败', icon: 'none' });
    showQrcode.value = false;
  });
}

// 获取后端基础 URL
function getBaseUrl() {
  // #ifdef H5
  return '';
  // #endif
  // #ifndef H5
  return 'http://localhost:3333';
  // #endif
}

// 模拟扫码进入（开发调试用）
function simulateScan() {
  const d = qrcodeData.value;
  if (!d.qrcode_id) {
    uni.showToast({ title: '数据未加载', icon: 'none' });
    return;
  }

  showQrcode.value = false;

  if (qrcodeMode.value === 'post') {
    // 单条料单 → 跳转客户端详情页
    uni.navigateTo({ url: `/pages/client/detail?id=${d.post_id}&merchantId=${d.qrcode_id}` });
  } else {
    // 主页 → 跳转客户端主页
    uni.navigateTo({ url: `/pages/client/home?merchantId=${d.qrcode_id}` });
  }
}

// 保存二维码到相册
function saveQrcode() {
  if (!qrcodeUrl.value) {
    uni.showToast({ title: '二维码未加载', icon: 'none' });
    return;
  }

  uni.downloadFile({
    url: qrcodeUrl.value,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            uni.showToast({ title: '已保存到相册', icon: 'success' });
          },
          fail: () => {
            uni.showToast({ title: '保存失败，请授权相册权限', icon: 'none' });
          }
        });
      } else {
        uni.showToast({ title: '长按截图即可分享', icon: 'none' });
      }
    },
    fail: () => {
      uni.showToast({ title: '长按截图即可分享', icon: 'none' });
    }
  });
}
</script>

<style scoped>
.manage-page { min-height: 100vh; background: #F5F5F5; padding-bottom: 140rpx; }

.search-bar {
  padding: 20rpx 24rpx; background: #FFFFFF;
  display: flex; align-items: center; gap: 16rpx;
}
.search-bar .search-input-wrap {
  display: flex; align-items: center; background: #F5F5F5;
  border-radius: 16rpx; padding: 0 24rpx; flex: 1;
}
.search-bar .search-input-wrap .search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-bar .search-input-wrap .search-input { flex: 1; height: 72rpx; font-size: 28rpx; }

.search-bar .share-btn {
  height: 72rpx; background: #E53935; color: #FFFFFF;
  border-radius: 16rpx; padding: 0 20rpx;
  font-size: 24rpx; display: flex; align-items: center; gap: 6rpx; flex-shrink: 0;
}
.search-bar .share-btn .share-icon { font-size: 28rpx; }
.search-bar .share-btn:active { opacity: 0.85; }

.tab-scroll { background: #FFFFFF; white-space: nowrap; }
.tab-scroll .tab-wrap { display: inline-flex; padding: 0 24rpx; }
.tab-scroll .tab-wrap .tab-item {
  padding: 24rpx 28rpx; font-size: 28rpx; color: #666666; display: inline-block;
}
.tab-scroll .tab-wrap .tab-item.active { color: #E53935; font-weight: bold; position: relative; }
.tab-scroll .tab-wrap .tab-item.active::after {
  content: ''; position: absolute; bottom: 4rpx; left: 28rpx; right: 28rpx;
  height: 4rpx; background: #E53935; border-radius: 2rpx;
}

.list-wrap { padding: 24rpx; }

.post-card { background: #FFFFFF; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; }

.post-card .card-header .card-title-row { display: flex; align-items: center; justify-content: space-between; }
.post-card .card-header .card-title-row .card-title { flex: 1; font-size: 32rpx; font-weight: bold; color: #333; }
.post-card .card-header .card-title-row .card-status { font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 6rpx; }
.post-card .card-header .card-title-row .card-status.on { background: #E8F5E9; color: #4CAF50; }
.post-card .card-header .card-title-row .card-status.off { background: #FFF3E0; color: #FF9800; }

.post-card .card-header .card-tags { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 16rpx; }
.post-card .card-header .card-tags .tag { font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 6rpx; }
.post-card .card-header .card-tags .tag.red { background: #FFEBEE; color: #E53935; }
.post-card .card-header .card-tags .tag.gray { background: #F5F5F5; color: #666666; }
.post-card .card-header .card-tags .tag.orange { background: #FFF3E0; color: #E65100; }

.post-card .card-summary { font-size: 26rpx; color: #666; margin-top: 16rpx; line-height: 1.6; }

.post-card .card-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 20rpx; padding-top: 20rpx; border-top: 1rpx solid #F0F0F0;
  flex-wrap: wrap; gap: 12rpx;
}
.post-card .card-footer .card-date { font-size: 24rpx; color: #999; }
.post-card .card-footer .card-actions { display: flex; gap: 12rpx; flex-wrap: wrap; }
.post-card .card-footer .card-actions .action-btn { font-size: 22rpx; padding: 8rpx 16rpx; border-radius: 6rpx; }
.post-card .card-footer .card-actions .action-btn.gray { background: #F5F5F5; color: #666; }
.post-card .card-footer .card-actions .action-btn.red { background: #FFEBEE; color: #E53935; }
.post-card .card-footer .card-actions .action-btn.share-btn-small {
  background: #FFF3E0; color: #E65100; display: flex; align-items: center; gap: 4rpx;
}
.post-card .card-footer .card-actions .share-icon-small { font-size: 22rpx; }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 200rpx; }
.empty-state .empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-state .empty-text { font-size: 28rpx; color: #999; }

.bottom-fixed {
  position: fixed; bottom: 0; left: 0; right: 0; padding: 20rpx 40rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); background: #FFFFFF;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.add-btn {
  height: 96rpx; background: #E53935; color: #FFFFFF; border-radius: 12rpx;
  font-size: 32rpx; font-weight: bold; display: flex; align-items: center;
  justify-content: center; gap: 8rpx;
}
.add-btn .add-icon { font-size: 40rpx; }
.add-btn:active { opacity: 0.85; }

.placeholder { color: #CCCCCC; font-size: 28rpx; }

/* 二维码弹窗 */
.qrcode-modal-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5); display: flex;
  align-items: center; justify-content: center; z-index: 999;
}
.qrcode-modal {
  background: #FFFFFF; border-radius: 20rpx; padding: 48rpx 40rpx 32rpx;
  width: 580rpx; text-align: center;
}
.qrcode-modal .qrcode-title { font-size: 36rpx; font-weight: bold; color: #333; display: block; }
.qrcode-modal .qrcode-desc { font-size: 26rpx; color: #999; margin-top: 8rpx; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.qrcode-wrap {
  width: 360rpx; height: 360rpx; margin: 32rpx auto;
  border: 2rpx dashed #E0E0E0; border-radius: 12rpx;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.qrcode-wrap .qrcode-img { width: 100%; height: 100%; }
.qrcode-wrap .qrcode-loading { font-size: 28rpx; color: #CCC; }

.qrcode-modal .qrcode-tip { font-size: 24rpx; color: #999; margin-bottom: 32rpx; display: block; }

.qrcode-actions { }
.qrcode-actions .qrcode-save-btn {
  height: 88rpx; background: #E53935; color: #FFFFFF;
  border-radius: 12rpx; font-size: 30rpx; font-weight: bold;
  display: flex; align-items: center; justify-content: center;
}
.qrcode-actions .qrcode-save-btn:active { opacity: 0.85; }

.qrcode-actions .qrcode-debug-btn {
  height: 80rpx; background: #1565C0; color: #FFFFFF;
  border-radius: 12rpx; font-size: 28rpx; font-weight: bold;
  display: flex; align-items: center; justify-content: center;
  margin-top: 16rpx;
}
.qrcode-actions .qrcode-debug-btn:active { opacity: 0.85; }

.qrcode-actions .qrcode-close {
  margin-top: 20rpx; font-size: 28rpx; color: #999; padding: 12rpx;
}
</style>
