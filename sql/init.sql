-- ============================================
-- 爆料付费查看系统 - 数据库初始化脚本
-- 数据库: zz
-- ============================================

CREATE DATABASE IF NOT EXISTS `zz` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `zz`;

-- 商家表
CREATE TABLE IF NOT EXISTS `merchants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `phone` VARCHAR(11) NOT NULL UNIQUE COMMENT '手机号',
  `name` VARCHAR(100) DEFAULT '' COMMENT '商家名称',
  `avatar` VARCHAR(500) DEFAULT '' COMMENT '头像URL',
  `intro` VARCHAR(500) DEFAULT '' COMMENT '商家简介',
  `qrcode_id` VARCHAR(50) UNIQUE COMMENT '二维码唯一标识',
  `status` TINYINT DEFAULT 1 COMMENT '1:正常 0:禁用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家表';

-- 爆料内容表
CREATE TABLE IF NOT EXISTS `posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `merchant_id` INT NOT NULL COMMENT '商家ID',
  `title` VARCHAR(96) NOT NULL COMMENT '标题(96字内)',
  `lianhong_tag` VARCHAR(10) DEFAULT '' COMMENT '连红标签',
  `tag` VARCHAR(50) DEFAULT '' COMMENT '其他标签',
  `summary` TEXT COMMENT '简介(选填)',
  `paid_content` TEXT NOT NULL COMMENT '付费正文内容',
  `image_url` VARCHAR(500) DEFAULT '' COMMENT '配图URL',
  `price` DECIMAL(10,2) DEFAULT 9.90 COMMENT '价格',
  `is_presale` TINYINT DEFAULT 0 COMMENT '是否预售 1:是 0:否',
  `post_type` ENUM('normal','package','norefund','presale') DEFAULT 'normal' COMMENT '内容类型',
  `status` TINYINT DEFAULT 1 COMMENT '1:上架 0:下架',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发布日期',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE,
  INDEX `idx_merchant_date` (`merchant_id`, `created_at`),
  INDEX `idx_type` (`post_type`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='爆料内容表';

-- 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `post_id` INT NOT NULL COMMENT '内容ID',
  `merchant_id` INT NOT NULL COMMENT '商家ID',
  `buyer_openid` VARCHAR(100) NOT NULL COMMENT '买家微信openid',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '支付金额',
  `pay_status` TINYINT DEFAULT 0 COMMENT '0:未支付 1:已支付',
  `transaction_id` VARCHAR(100) DEFAULT '' COMMENT '微信交易单号',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  `paid_at` DATETIME DEFAULT NULL COMMENT '支付时间',
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE,
  INDEX `idx_buyer` (`buyer_openid`),
  INDEX `idx_merchant` (`merchant_id`),
  INDEX `idx_post` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
