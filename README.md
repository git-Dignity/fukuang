# 爆料付费查看系统 — README

## 项目介绍

- **前端**：uni-app + Vue 3（微信小程序 + 可转 APP）
- **后端**：Node.js + Express + MySQL（端口 3333）
- **鉴权**：商家 JWT 登录，客户端免登录
- **支付**：微信商户支付

---

## 项目文件清单（共 28 个文件）

```
fukuang/
├── .env                          # 环境变量（端口/数据库/JWT）
├── .gitignore
├── package.json                  # 后端依赖
├── PROJECT_PLAN.md               # 完整开发计划文档
├── sql/
│   └── init.sql                  # 数据库建表（3张表）
├── server/                       # Node.js 后端
│   ├── app.js                    # 入口（端口3333）
│   ├── config/
│   │   ├── db.js                 # MySQL 连接池
│   │   └── config.js             # 全局配置
│   ├── middleware/
│   │   └── auth.js               # JWT 鉴权中间件
│   ├── models/
│   │   ├── Merchant.js           # 商家数据模型
│   │   ├── Post.js               # 内容数据模型（含今日/往期判定）
│   │   └── Order.js              # 订单数据模型
│   ├── controllers/
│   │   ├── merchantController.js # 商家端业务（登录/CRUD/订单）
│   │   ├── clientController.js   # 客户端业务（主页/详情）
│   │   └── payController.js      # 微信支付（统一下单/回调）
│   ├── routes/
│   │   ├── merchant.js           # 商家路由（12个接口）
│   │   ├── client.js             # 客户端路由（4个接口）
│   │   └── upload.js             # 文件上传
│   └── utils/
│       └── wechatPay.js          # 微信支付工具
└── client/                       # uni-app + Vue3 前端
    ├── manifest.json             # 应用配置
    ├── pages.json                # 页面路由 + 商家TabBar
    ├── main.js
    ├── App.vue
    ├── uni.scss
    ├── utils/
    │   ├── request.js            # HTTP 封装（自动 Token）
    │   └── api.js                # API 接口集合
    └── pages/
        ├── merchant/
        │   ├── login.vue         # 商家登录（手机号+验证码）
        │   ├── publish.vue       # 发布爆料（标题/标签/正文/配图）
        │   ├── manage.vue        # 内容管理（分类/搜索/上下架/删除）
        │   ├── edit.vue          # 编辑内容
        │   └── orders.vue        # 订单数据（汇总+列表）
        └── client/
            ├── home.vue          # 商家主页（今日付费/往期免费）
            └── detail.vue        # 内容详情 + 支付解锁弹窗
```

---

## 数据库表

| 表名 | 说明 |
|------|------|
| `merchants` | 商家表（手机号、名称、简介、二维码ID） |
| `posts` | 爆料内容表（标题、连红标签、简介、付费正文、配图、价格、类型、上架状态） |
| `orders` | 订单表（内容ID、商家ID、买家openid、金额、支付状态、交易单号） |

**数据库信息：**
- 地址：39.108.235.72
- 端口：3306
- 数据库名：zz
- 用户名：abcd
- 密码：pfELWYmPKX5T5x4S

---

## 启动步骤

### 1. 初始化数据库

将 `sql/init.sql` 导入 MySQL：

```bash
mysql -h 39.108.235.72 -P 3306 -u abcd -p zz < sql/init.sql
# 密码：pfELWYmPKX5T5x4S
```

建表成功后，自动创建 `merchants`、`posts`、`orders` 三张表。

### 2. 安装依赖并启动后端

```bash
# 安装依赖
npm install

# 启动后端（端口 3333）
npm start
```

启动成功后输出：
```
[MySQL] 数据库连接成功
[Server] 服务已启动，端口: 3333
[Server] 地址: http://localhost:3333
```

### 3. 前端运行

用 **HBuilderX** 打开 `client/` 目录：

1. 在 `manifest.json` 中填入小程序 AppID
2. 点击「运行」→「运行到小程序模拟器」→「微信开发者工具」

---

## 后端 API 接口

### 商家端 API（需 JWT 鉴权）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/merchant/send-code` | POST | 发送手机验证码 |
| `/api/merchant/login` | POST | 手机号 + 验证码登录 |
| `/api/merchant/info` | GET | 获取当前商家信息 |
| `/api/merchant/info` | PUT | 更新商家信息 |
| `/api/merchant/qrcode` | GET | 获取专属二维码ID |
| `/api/merchant/posts` | POST | 发布爆料内容 |
| `/api/merchant/posts` | GET | 获取发布列表（支持 type/status 筛选） |
| `/api/merchant/posts/:id` | PUT | 编辑爆料内容 |
| `/api/merchant/posts/:id` | DELETE | 删除爆料内容 |
| `/api/merchant/posts/:id/status` | PUT | 上下架切换 |
| `/api/merchant/orders` | GET | 查看订单收款数据 |
| `/api/upload` | POST | 图片上传 |

### 客户端 API（免登录）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/client/home/:merchantId` | GET | 商家主页内容列表（自动区分今日/往期） |
| `/api/client/post/:id` | GET | 内容详情（往期返回全文；今日仅返回标题简介） |
| `/api/client/pay` | POST | 发起微信支付（统一下单） |
| `/api/client/pay/callback` | POST | 微信支付回调通知 |

---

## 待配置项

| 项目 | 文件 | 说明 |
|------|------|------|
| **微信 AppID + Secret** | `.env` | `WECHAT_APPID` / `WECHAT_SECRET` |
| **微信商户号 + API密钥** | `.env` | `WECHAT_MCHID` / `WECHAT_API_KEY` |
| **支付回调地址** | `server/config/config.js` | `notifyUrl` 字段，部署到公网后填写 |
| **短信验证码服务** | `server/controllers/merchantController.js` 第22行 | 当前验证码固定 `1234`，需对接阿里云等短信服务 |
| **小程序 AppID** | `client/manifest.json` | `mp-weixin.appid` |
| **服务器域名白名单** | 微信公众平台后台 | 添加 `request` 合法域名、`uploadFile` 合法域名 |
| **static 图标** | `client/static/` | 需要放入 TabBar 图标：`tab-manage.png`、`tab-manage-active.png`、`tab-orders.png`、`tab-orders-active.png` |

---

## 核心业务逻辑

- **时间判定**：`DATE(created_at) = CURDATE()` → 今日付费；否则 → 往期免费
- **免登录**：客户端通过 URL `?merchantId=xxx` 带入商家 ID，无需注册
- **权限隔离**：商家只能管理自己的内容，所有查询带 `WHERE merchant_id = ?`
- **支付流程**：`wx.login() → code → 后端换 openid → 统一下单 → wx.requestPayment() → 回调更新订单`
