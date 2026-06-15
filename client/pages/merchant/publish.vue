<template>
  <view class="publish-page">
    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- 表单 -->
    <view class="form-wrap">
      <!-- 标题（必填） -->
      <view class="form-section">
        <view class="section-label">
          标题 <text class="required">*</text>
        </view>
        <textarea
          v-model="form.title"
          class="input title-input"
          maxlength="96"
          placeholder="请输入标题，最多96字"
          placeholder-class="placeholder"
        />
        <text class="count-tip">{{ (form.title || '').length }}/96</text>
      </view>

      <!-- 预售开关 -->
      <view class="form-section row">
        <text class="section-label">预售内容</text>
        <switch
          :checked="form.is_presale"
          color="#E53935"
          @change="e => form.is_presale = e.detail.value"
        />
      </view>

      <!-- 连红标签 -->
      <view class="form-section">
        <view class="section-label">连红标签</view>
        <input
          v-model="form.lianhong_tag"
          class="input"
          maxlength="6"
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
          maxlength="20"
          placeholder="如：15中10"
          placeholder-class="placeholder"
        />
      </view>

      <!-- 简介（选填） -->
      <view class="form-section">
        <view class="section-label">简介 <text class="optional">(选填)</text></view>
        <textarea
          v-model="form.summary"
          class="input textarea"
          maxlength="500"
          placeholder="请输入简介"
          placeholder-class="placeholder"
        />
      </view>

      <!-- 配图上传 -->
      <view class="form-section">
        <view class="section-label">配图 <text class="optional">(选填)</text></view>
        <view class="upload-area">
          <view v-if="form.image_url" class="img-preview" @click="uploadImage">
            <image :src="form.image_url" mode="aspectFill" class="preview-img" />
            <view class="img-remove" @click.stop="form.image_url = ''">×</view>
          </view>
          <view v-else class="upload-btn" @click="uploadImage">
            <text class="upload-icon">+</text>
            <text class="upload-text">上传图片</text>
          </view>
        </view>
      </view>

      <!-- 付费正文（必填） -->
      <view class="form-section">
        <view class="section-label">
          付费正文内容 <text class="required">*</text>
        </view>
        <textarea
          v-model="form.paid_content"
          class="input content-input"
          placeholder="请输入付费正文内容"
          placeholder-class="placeholder"
        />
      </view>

      <!-- 价格设置 -->
      <view class="form-section row">
        <text class="section-label">价格 (元)</text>
        <input
          v-model="form.price"
          class="input price-input"
          type="digit"
          placeholder="9.90"
          placeholder-class="placeholder"
        />
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-fixed">
      <view class="submit-btn" @click="handleSubmit">
        提交发布
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import api from '../../utils/api';

const activeTab = ref('normal');
const tabs = [
  { label: '爆料', value: 'normal' },
  { label: '包时套餐', value: 'package' }
];

const form = reactive({
  title: '',
  lianhong_tag: '',
  tag: '',
  summary: '',
  paid_content: '',
  image_url: '',
  price: '9.90',
  is_presale: false
});

// 上传图片
function uploadImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    success: (res) => {
      uni.showLoading({ title: '上传中...' });
      api.uploadImage(res.tempFilePaths[0]).then(data => {
        uni.hideLoading();
        if (data.code === 0) {
          // 服务器返回的相对路径，拼接完整URL
          const baseUrl = 'http://localhost:3333';
          form.image_url = baseUrl + data.data.url;
        } else {
          uni.showToast({ title: data.message, icon: 'none' });
        }
      }).catch(() => {
        uni.hideLoading();
        uni.showToast({ title: '上传失败', icon: 'none' });
      });
    }
  });
}

// 提交发布
function handleSubmit() {
  if (!form.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' });
    return;
  }
  if (!form.paid_content.trim()) {
    uni.showToast({ title: '请输入付费正文内容', icon: 'none' });
    return;
  }

  // 确定内容类型
  let post_type = activeTab.value;
  if (form.is_presale) {
    post_type = 'presale';
  }

  uni.showLoading({ title: '提交中...' });
  api.createPost({
    title: form.title,
    lianhong_tag: form.lianhong_tag,
    tag: form.tag,
    summary: form.summary,
    paid_content: form.paid_content,
    image_url: form.image_url,
    price: parseFloat(form.price) || 9.90,
    is_presale: form.is_presale ? 1 : 0,
    post_type
  }).then(res => {
    uni.hideLoading();
    if (res.code === 0) {
      uni.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => {
        uni.navigateBack();
      }, 800);
    } else {
      uni.showToast({ title: res.message, icon: 'none' });
    }
  }).catch(() => {
    uni.hideLoading();
    uni.showToast({ title: '提交失败', icon: 'none' });
  });
}
</script>

<style scoped>
.publish-page { min-height: 100vh; background: #F5F5F5; padding-bottom: 140rpx; }

.tab-bar { display: flex; background: #FFFFFF; padding: 0 40rpx; border-bottom: 1rpx solid #F0F0F0; }
.tab-bar .tab-item { padding: 30rpx 32rpx; font-size: 30rpx; color: #666666; position: relative; }
.tab-bar .tab-item.active { color: #E53935; font-weight: bold; }
.tab-bar .tab-item.active::after {
  content: ''; position: absolute; bottom: 0; left: 32rpx; right: 32rpx;
  height: 4rpx; background: #E53935; border-radius: 2rpx;
}

.form-wrap { padding: 24rpx; }

.form-section { background: #FFFFFF; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; }
.form-section.row { display: flex; align-items: center; justify-content: space-between; }

.section-label { font-size: 28rpx; color: #333333; font-weight: 500; margin-bottom: 16rpx; }
.required { color: #E53935; }
.optional { color: #999999; font-size: 24rpx; font-weight: normal; }

.input {
  width: 100%; height: 80rpx; background: #F8F8F8; border-radius: 8rpx;
  padding: 0 20rpx; font-size: 28rpx; box-sizing: border-box;
}
.textarea { height: 160rpx; padding: 16rpx 20rpx; }
.title-input { height: 120rpx; padding: 16rpx 20rpx; }
.content-input { height: 300rpx; padding: 16rpx 20rpx; }
.price-input { width: 160rpx; text-align: right; }
.count-tip { font-size: 22rpx; color: #999999; text-align: right; margin-top: 8rpx; }

.upload-area .upload-btn {
  width: 200rpx; height: 200rpx; background: #F8F8F8;
  border: 2rpx dashed #DDDDDD; border-radius: 12rpx;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.upload-area .upload-btn .upload-icon { font-size: 56rpx; color: #CCCCCC; }
.upload-area .upload-btn .upload-text { font-size: 24rpx; color: #999999; margin-top: 8rpx; }

.upload-area .img-preview { width: 200rpx; height: 200rpx; position: relative; }
.upload-area .img-preview .preview-img { width: 100%; height: 100%; border-radius: 12rpx; }
.upload-area .img-preview .img-remove {
  position: absolute; top: -10rpx; right: -10rpx; width: 40rpx; height: 40rpx;
  background: rgba(0, 0, 0, 0.5); color: #FFFFFF; border-radius: 50%;
  text-align: center; line-height: 40rpx; font-size: 28rpx;
}

.bottom-fixed {
  position: fixed; bottom: 0; left: 0; right: 0; padding: 20rpx 40rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); background: #FFFFFF;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}
.submit-btn {
  height: 96rpx; background: #E53935; color: #FFFFFF; border-radius: 12rpx;
  font-size: 34rpx; font-weight: bold; display: flex; align-items: center; justify-content: center;
}
.submit-btn:active { opacity: 0.85; }
.placeholder { color: #CCCCCC; font-size: 28rpx; }
</style>
