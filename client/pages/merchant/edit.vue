<template>
  <view class="edit-page">
    <view class="form-wrap">
      <!-- 标题 -->
      <view class="form-section">
        <view class="section-label">标题 <text class="required">*</text></view>
        <textarea
          v-model="form.title"
          class="input title-input"
          maxlength="96"
          placeholder="请输入标题"
          placeholder-class="placeholder"
        />
      </view>

      <!-- 连红标签 -->
      <view class="form-section">
        <view class="section-label">连红标签</view>
        <input
          v-model="form.lianhong_tag"
          class="input"
          placeholder="如：3连红"
          placeholder-class="placeholder"
        />
      </view>

      <!-- 标签 -->
      <view class="form-section">
        <view class="section-label">标签</view>
        <input
          v-model="form.tag"
          class="input"
          placeholder="如：15中10"
          placeholder-class="placeholder"
        />
      </view>

      <!-- 简介 -->
      <view class="form-section">
        <view class="section-label">简介</view>
        <textarea
          v-model="form.summary"
          class="input textarea"
          placeholder="请输入简介"
          placeholder-class="placeholder"
        />
      </view>

      <!-- 配图 -->
      <view class="form-section">
        <view class="section-label">配图</view>
        <view class="upload-area">
          <view v-if="form.image_url" class="img-preview" @click="uploadImage">
            <image :src="form.image_url" mode="aspectFill" class="preview-img" />
            <view class="img-remove" @click.stop="form.image_url = ''">×</view>
          </view>
          <view v-else class="upload-btn" @click="uploadImage">
            <text class="upload-icon">+</text>
          </view>
        </view>
      </view>

      <!-- 付费正文 -->
      <view class="form-section">
        <view class="section-label">付费正文内容 <text class="required">*</text></view>
        <textarea
          v-model="form.paid_content"
          class="input content-input"
          placeholder="请输入付费正文内容"
          placeholder-class="placeholder"
        />
      </view>

      <!-- 价格 -->
      <view class="form-section row">
        <text class="section-label">价格 (元)</text>
        <input
          v-model="form.price"
          class="input price-input"
          type="digit"
        />
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-fixed">
      <view class="submit-btn" @click="handleSave">
        保存修改
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onLoad } from 'vue';
import api from '../../utils/api';

const postId = ref(null);

const form = reactive({
  title: '',
  lianhong_tag: '',
  tag: '',
  summary: '',
  paid_content: '',
  image_url: '',
  price: '9.90'
});

onLoad((options) => {
  postId.value = options.id;
  loadDetail();
});

// 加载旧数据
function loadDetail() {
  // 通过商家管理接口获取详情
  api.getPosts().then(res => {
    if (res.code === 0) {
      const post = res.data.find(p => p.id == postId.value);
      if (post) {
        form.title = post.title;
        form.lianhong_tag = post.lianhong_tag || '';
        form.tag = post.tag || '';
        form.summary = post.summary || '';
        form.paid_content = post.paid_content || '';
        form.image_url = post.image_url || '';
        form.price = String(post.price || '9.90');
      }
    }
  });
}

// 上传图片
function uploadImage() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      uni.showLoading({ title: '上传中...' });
      api.uploadImage(res.tempFilePaths[0]).then(data => {
        uni.hideLoading();
        if (data.code === 0) {
          const baseUrl = 'http://localhost:3333';
          form.image_url = baseUrl + data.data.url;
        }
      }).catch(() => {
        uni.hideLoading();
      });
    }
  });
}

// 保存
function handleSave() {
  if (!form.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' });
    return;
  }
  if (!form.paid_content.trim()) {
    uni.showToast({ title: '请输入付费正文', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '保存中...' });
  api.updatePost(postId.value, {
    title: form.title,
    lianhong_tag: form.lianhong_tag,
    tag: form.tag,
    summary: form.summary,
    paid_content: form.paid_content,
    image_url: form.image_url,
    price: parseFloat(form.price) || 9.90
  }).then(res => {
    uni.hideLoading();
    if (res.code === 0) {
      uni.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 800);
    } else {
      uni.showToast({ title: res.message, icon: 'none' });
    }
  }).catch(() => {
    uni.hideLoading();
  });
}
</script>

<style lang="scss" scoped>
.edit-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 140rpx;
}

.form-wrap {
  padding: 24rpx;
}

.form-section {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;

  &.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.section-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.required { color: #E53935; }

.input {
  width: 100%;
  height: 80rpx;
  background: #F8F8F8;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.title-input { height: 120rpx; padding: 16rpx 20rpx; }
.textarea { height: 160rpx; padding: 16rpx 20rpx; }
.content-input { height: 300rpx; padding: 16rpx 20rpx; }
.price-input { width: 160rpx; text-align: right; }

.upload-area {
  .upload-btn {
    width: 160rpx;
    height: 160rpx;
    background: #F8F8F8;
    border: 2rpx dashed #DDD;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .upload-icon {
      font-size: 56rpx;
      color: #CCC;
    }
  }

  .img-preview {
    width: 160rpx;
    height: 160rpx;
    position: relative;

    .preview-img {
      width: 100%;
      height: 100%;
      border-radius: 12rpx;
    }

    .img-remove {
      position: absolute;
      top: -10rpx;
      right: -10rpx;
      width: 40rpx;
      height: 40rpx;
      background: rgba(0,0,0,0.5);
      color: #FFF;
      border-radius: 50%;
      text-align: center;
      line-height: 40rpx;
      font-size: 28rpx;
    }
  }
}

.bottom-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 40rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #FFF;
  box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.06);
}

.submit-btn {
  height: 96rpx;
  background: #E53935;
  color: #FFF;
  border-radius: 12rpx;
  font-size: 34rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  &:active { opacity: 0.85; }
}

.placeholder { color: #CCC; font-size: 28rpx; }
</style>
