-- 创建数据库
CREATE DATABASE IF NOT EXISTS `traceability_system_2` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `traceability_system_2`;

-- 1.生产者/农户表 (修改后)
-- 首先创建表
CREATE TABLE `producers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '生产者ID',
  `account` VARCHAR(100) NOT NULL COMMENT '登录账号 (唯一)',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '哈希后的密码',
  `name` VARCHAR(255) DEFAULT NULL COMMENT '生产者名称/公司名',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `role` VARCHAR(50) NOT NULL DEFAULT 'producer' COMMENT '角色标识',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_account` (`account`)
) COMMENT='生产者信息表 (使用账号密码登录)';

-- 2. 管理员表
CREATE TABLE `admins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` VARCHAR(100) NOT NULL COMMENT '用户名',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '哈希后的密码',
  `role` VARCHAR(50) NOT NULL DEFAULT 'admin' COMMENT '角色' ,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) COMMENT='系统管理员表';

-- 3. 产品表 
CREATE TABLE `product_batches` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '批次ID',
  `producer_id` INT UNSIGNED NOT NULL COMMENT '生产者ID',
  `vegetable_name` VARCHAR(100) NOT NULL COMMENT '蔬菜名称 (如: 番茄)',
  `vegetable_variety` VARCHAR(100) DEFAULT NULL COMMENT '蔬菜品种 (如: 圣女果)',
  `image_url` VARCHAR(255) DEFAULT NULL COMMENT '产品图片URL',
  `origin` VARCHAR(255) NOT NULL COMMENT '具体产地 (如: XX农场3号大棚)',
  `planting_time` DATETIME NOT NULL COMMENT '种植时间',
  `harvest_time` DATETIME NOT NULL COMMENT '收获时间',
  `description` TEXT DEFAULT NULL COMMENT '批次描述信息 (如: 本批次采用有机肥)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`producer_id`) REFERENCES `producers`(`id`)
) COMMENT='产品溯源批次表';

-- 4.安全检测信息表
CREATE TABLE `safety_inspections` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '检测记录ID',
  `batch_id` INT UNSIGNED NOT NULL COMMENT '关联的产品批次ID',
  `creator_id` INT UNSIGNED NOT NULL COMMENT '创建者ID (producers.id 或 admins.id)',
  `risk_factor_type` VARCHAR(255) NOT NULL COMMENT '检测的安全风险因子类型 (如: 农药残留, 重金属)',
  `inspection_time` DATETIME NOT NULL COMMENT '检测时间',
  `result_image_url` VARCHAR(255) DEFAULT NULL COMMENT '检测结果图片URL',
  `manual_result` ENUM('合格', '不合格') NOT NULL COMMENT '手动输入的检测结果',
  `component_analysis` TEXT DEFAULT NULL COMMENT '产品成分检测文字描述',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`batch_id`) REFERENCES `product_batches`(`id`)
) COMMENT='安全检测信息表';

-- 6. 溯源码表
CREATE TABLE `qr_codes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '溯源码ID',
  `batch_id` INT UNSIGNED NOT NULL COMMENT '关联的产品批次ID',
  `code_data` VARCHAR(255) NOT NULL COMMENT '二维码的唯一标识字符串',
  `access_url` VARCHAR(255) NOT NULL COMMENT '扫码后访问的URL',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否激活',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code_data` (`code_data`),
  FOREIGN KEY (`batch_id`) REFERENCES `product_batches`(`id`)
) COMMENT='溯源码信息表';

CREATE TABLE `system_config` (
  `key` VARCHAR(255) NOT NULL,
  `value` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`key`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;