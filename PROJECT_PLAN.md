# 爆料付费查看系统 — 完整开发计划

## 技术架构

- **前端**：uni-app + Vue 3（微信小程序 + 可转 APP）
- **后端**：Node.js + Express + MySQL
- **鉴权**：商家 JWT 登录，客户端免登录
- **支付**：微信商户支付 V2/V3

### 环境配置

| 配置项 | 值 |
|--------|-----|
| Node 端口 | **3333** |
| MySQL 地址 | **39.108.235.72** |
| MySQL 端口 | **3306** |
| 数据库名 | **zz** |
| 用户名 | **abcd** |
| 密码 | **pfELWYmPKX5T5x4S** |

---

## 目录结构

```
fukuang/
├── server/                    # Node.js 后端
│   ├── config/
│   │   ├── db.js              # MySQL 连接配置
│   │   └── config.js          # 全局配置（微信支付参数等）
│   ├── routes/
│   │   ├── merchant.js        # 商家端路由
│   │   ├── client.js          # 客户端路由
│   │   └── upload.js          # 文件上传路由
│   ├── controllers/
│   │   ├── merchantController.js
│   │   ├── clientController.js
│   │   ├── payController.js
│   │   └── uploadController.js
│   ├── models/
│   │   ├── Merchant.js        # 商家数据操作
│   │   ├── Post.js            # 爆料内容数据操作
│   │   └── Order.js           # 订单数据操作
│   ├── middleware/
│   │   └── auth.js            # JWT 鉴权中间件
│   ├── utils/
│   │   ├── wechatPay.js       # 微信支付工具
│   │   ├── sms.js             # 短信验证码工具
│   │   └── qrcode.js          # 二维码生成工具
│   ├── uploads/               # 上传文件存储
│   └── app.js                 # 入口文件
├── client/                    # uni-app 前端
│   ├── pages/
│   │   ├── merchant/
│   │   │   ├── login.vue      # 商家登录（手机号验证码）
│   │   │   ├── publish.vue    # 发布爆料
│   │   │   ├── manage.vue     # 内容管理列表
│   │   │   ├── edit.vue       # 编辑内容
│   │   │   └── orders.vue     # 订单收款数据
│   │   └── client/
│   │       ├── home.vue       # 商家主页（扫码进入）
│   │       └── detail.vue     # 内容详情 + 支付解锁
│   ├── components/
│   │   ├── PostCard.vue       # 内容卡片组件
│   │   └── PayModal.vue       # 支付弹窗组件
│   ├── utils/
│   │   ├── request.js         # uni.request 封装
│   │   └── api.js             # API 接口集合
│   ├── static/                # 静态资源
│   ├── App.vue
│   ├── pages.json             # 页面路由配置
│   ├── manifest.json          # 应用配置
│   └── main.js
├── sql/
│   └── init.sql               # 数据库建表脚本
├── package.json               # 后端依赖
└── README.md
```

---

## 数据库设计

### 表结构

**merchants — 商家表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT | 主键 |
| phone | VARCHAR(11) UNIQUE | 手机号 |
| name | VARCHAR(100) | 商家/昵称 |
| avatar | VARCHAR(500) | 头像URL |
| intro | VARCHAR(500) | 商家简介 |
| qrcode_id | VARCHAR(50) UNIQUE | 二维码唯一标识 |
| status | TINYINT DEFAULT 1 | 状态 1:正常 0:禁用 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

**posts — 爆料内容表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT | 主键 |
| merchant_id | INT | 商家ID（外键） |
| title | VARCHAR(96) | 标题（96字内） |
| lianhong_tag | VARCHAR(10) | 连红标签（如"3连红"） |
| tag | VARCHAR(50) | 其他标签（如"15中10"） |
| summary | TEXT | 简介（选填） |
| paid_content | TEXT | 付费正文内容 |
| image_url | VARCHAR(500) | 配图URL |
| price | DECIMAL(10,2) DEFAULT 9.90 | 价格 |
| is_presale | TINYINT DEFAULT 0 | 是否预售 1:是 0:否 |
| post_type | ENUM('normal','package','norefund','presale') DEFAULT 'normal' | 内容类型 |
| status | TINYINT DEFAULT 1 | 1:上架 0:下架 |
| created_at | DATETIME | 发布日期 |
| updated_at | DATETIME | 更新时间 |

**orders — 订单表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT | 主键 |
| post_id | INT | 内容ID |
| merchant_id | INT | 商家ID |
| buyer_openid | VARCHAR(100) | 买家微信openid |
| amount | DECIMAL(10,2) | 支付金额 |
| pay_status | TINYINT DEFAULT 0 | 0:未支付 1:已支付 |
| transaction_id | VARCHAR(100) | 微信交易单号 |
| created_at | DATETIME | 下单时间 |
| paid_at | DATETIME | 支付时间 |

---

## 后端 API 接口

### 商家端 API（需 JWT 鉴权）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/merchant/send-code` | POST | 发送手机验证码 |
| `/api/merchant/login` | POST | 手机号 + 验证码登录 |
| `/api/merchant/info` | GET | 获取当前商家信息 |
| `/api/merchant/posts` | POST | 发布爆料内容 |
| `/api/merchant/posts` | GET | 获取发布列表（支持 type/status 筛选） |
| `/api/merchant/posts/:id` | PUT | 编辑爆料内容 |
| `/api/merchant/posts/:id` | DELETE | 删除爆料内容 |
| `/api/merchant/posts/:id/status` | PUT | 上下架切换 |
| `/api/merchant/orders` | GET | 查看订单收款数据 |
| `/api/merchant/qrcode` | GET | 获取专属小程序码 |
| `/api/upload` | POST | 图片上传 |

### 客户端 API（免登录）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/client/:merchantId/home` | GET | 商家主页内容列表（自动区分今日/往期） |
| `/api/client/post/:id` | GET | 内容详情（往期返回全文；今日仅返回标题简介） |
| `/api/client/pay` | POST | 发起微信支付（统一下单） |
| `/api/client/pay/callback` | POST | 微信支付回调通知 |

---

## 前端页面设计

### 商家端

**1. login.vue — 登录页**
- 手机号输入框
- 验证码输入框 + 发送倒计时按钮
- 登录按钮

**2. publish.vue — 发布爆料页（对应截图1）**
- 顶部 Tab：**爆料** / **包时套餐**
- 表单字段：
  - 标题（必填，96字内）
  - 预售开关（开关组件）
  - 连红标签（两位数，如"3天"）
  - 标签（如"15中10"）
  - 简介（选填，多行文本）
  - 配图（上传组件）
  - 付费正文内容（必填，富文本/多行文本）
- 底部红色按钮：**提交发布**

**3. manage.vue — 内容管理页（对应截图2）**
- 顶部搜索栏
- 分类 Tab：全部 / 包时套餐 / 不中退料 / 预售料
- 列表展示（卡片形式），每条可操作：编辑、删除、上下架
- 空状态：信封图标 + "暂无数据"
- 底部悬浮按钮：**+ 新建爆料**

**4. edit.vue — 编辑内容页**
- 与发布页表单相同，回填已有数据

**5. orders.vue — 订单收款页**
- 列表展示订单：内容标题、金额、支付状态、时间
- 汇总统计：总收入金额

### 客户端

**1. home.vue — 商家主页（对应截图3）**
- 顶部横幅区域：商家名称 + "扫码直达，往期全部免费查看"
- 内容卡片列表：
  - **往期卡片**：绿色标签 "往期免费"，显示连红、简介，绿色边框按钮 "点击直接查看全文"
  - **今日卡片**：橙色标签 "今日付费解锁"，显示连红、简介、价格，红色按钮 "支付 ¥9.9 查看全文"
- 下拉刷新

**2. detail.vue — 内容详情 + 支付解锁**
- 往期内容：展示完整标题 + 连红标签 + 简介 + 配图 + 付费正文全文
- 今日内容：
  - 未支付状态：显示标题 + 连红 + 简介 + 配图，正文遮罩 + 支付弹窗
  - 已支付状态：展示全部内容（标题 + 连红 + 简介 + 配图 + 付费正文全文）

---

## 核心业务逻辑

### 1. 时间自动判定
```
发布日期 ≠ 今日 → 免费全开
发布日期 = 今日 → 锁定付费内容
```

后端 SQL 判断：
```sql
-- 今日内容
SELECT * FROM posts WHERE status = 1 AND merchant_id = ? AND DATE(created_at) = CURDATE()
-- 往期内容
SELECT * FROM posts WHERE status = 1 AND merchant_id = ? AND DATE(created_at) < CURDATE()
```

### 2. 免登录访客浏览
- 客户端通过在 URL 中携带 `merchantId` 参数识别商家
- 小程序码扫码路径：`/pages/client/home?merchantId=xxx`
- 不需要微信授权手机号，仅支付环节使用微信支付授权

### 3. 权限隔离
- 商家 JWT token 包含 merchant_id
- 所有商家接口通过 auth 中间件验证 token
- 数据查询强制带 `WHERE merchant_id = ?` 条件

### 4. 微信支付流程
1. 前端 `wx.login()` 获取 code
2. 后端通过 `code` 换 `openid`
3. 后端调用微信统一下单 API，返回支付参数
4. 前端调 `wx.requestPayment()` 发起支付
5. 微信异步回调通知后端，更新订单状态
6. 前端轮询或 WebSocket 获取支付结果

### 5. 二维码生成
- 商家后台生成固定小程序码，指向 `/pages/client/home?merchantId=xxx`
- 使用微信小程序码 API 生成

---

## 分步实施计划

| 阶段 | 内容 | 涉及文件 |
|------|------|----------|
| **Phase 1** | 项目初始化：后端框架搭建 + 数据库建表 | `package.json`, `app.js`, `sql/init.sql`, `config/db.js`, `config/config.js` |
| **Phase 2** | 后端：商家模块（登录 + 爆料 CRUD + 上传） | `models/Merchant.js`, `models/Post.js`, `routes/merchant.js`, `controllers/merchantController.js`, `middleware/auth.js`, `routes/upload.js` |
| **Phase 3** | 后端：客户端接口 + 时间判定 + 微信支付 | `models/Order.js`, `routes/client.js`, `controllers/clientController.js`, `controllers/payController.js`, `utils/wechatPay.js` |
| **Phase 4** | 前端 uni-app 项目初始化 + 基础配置 | `client/` 项目骨架, `pages.json`, `manifest.json`, `App.vue`, `utils/request.js`, `utils/api.js` |
| **Phase 5** | 前端：商家端 5 个页面 | `pages/merchant/login.vue`, `publish.vue`, `manage.vue`, `edit.vue`, `orders.vue` |
| **Phase 6** | 前端：客户端 2 个页面 | `pages/client/home.vue`, `detail.vue`, `components/PostCard.vue`, `components/PayModal.vue` |
| **Phase 7** | 联调测试 + 二维码逻辑完善 + 细节优化 | 全局联调、支付回调验证、边界 case 处理 |

---

## 开发依赖

### 后端 (package.json)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.2",
    "dayjs": "^1.11.10",
    "qrcode": "^1.5.3",
    "uuid": "^9.0.0"
  }
}
```

### 前端 uni-app
- 微信小程序原生能力（wx.requestPayment）
- Vue 2/3（根据 uni-app 版本）

---

## 注意事项

1. ~~目前仓库为 git-Dignity/fukuang，请确认该仓库是否正确~~
2. 微信支付需要先去微信支付商户平台申请商户号、API 密钥
3. 小程序需要注册并通过审核，配置服务器域名白名单
4. 短信验证码服务需要对接第三方（如阿里云短信）
5. 生产环境需要将图片上传到 OSS/CDN，不要直接存服务器本地

---

> **最后更新**: 2026-06-15
> **版本**: v1.0
