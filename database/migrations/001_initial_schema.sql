-- 设施蔬菜溯源系统数据库初始化脚本
-- 创建时间: 2024-01-01
-- 版本: 1.0.1

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `traceability_system` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `traceability_system`;

-- 1. 角色信息表
CREATE TABLE `roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
  `description` TEXT NULL COMMENT '角色描述',
  `type` ENUM('admin', 'producer', 'consumer') NOT NULL DEFAULT 'consumer' COMMENT '角色类型',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色信息表';

-- 2. 企业信息表
CREATE TABLE `enterprises` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '企业名称',
  `contacts` VARCHAR(100) NOT NULL COMMENT '法人或负责人',
  `tel` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `license` VARCHAR(50) NOT NULL COMMENT '营业执照号',
  `address` TEXT NOT NULL COMMENT '地址',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业信息表';

-- 3. 用户信息表
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL UNIQUE COMMENT '登录账号',
  `password` VARCHAR(200) NOT NULL COMMENT '加密后的密码',
  `tel` VARCHAR(20) NULL COMMENT '联系电话',
  `role_id` INT NOT NULL COMMENT '用户所属角色',
  `enterprise_id` INT NULL COMMENT '用户所属企业',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprises`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息表';

-- 4. 产品信息表（添加生产者快照字段）
CREATE TABLE `products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '蔬菜名称',
  `image_url` VARCHAR(200) NULL COMMENT '产品主图URL',
  `producer_id` INT NOT NULL COMMENT '登记用户ID',
  `origin` VARCHAR(200) NOT NULL COMMENT '产地',
  `planting_date` DATE NOT NULL COMMENT '种植日期',
  `harvest_date` DATE NULL COMMENT '预计或实际采收日期',
  `test_type` VARCHAR(100) NULL COMMENT '检测类型',
  `test_date` DATE NULL COMMENT '检测时间',
  `test_report` VARCHAR(200) NULL COMMENT '检测报告文件链接',
  `is_qualified` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否合格',
  -- 生产者快照字段，便于前端直接展示
  `producer_name` VARCHAR(100) NULL COMMENT '生产者姓名快照',
  `producer_tel` VARCHAR(20) NULL COMMENT '生产者电话快照',
  `producer_enterprise` VARCHAR(100) NULL COMMENT '生产者所属企业快照',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`producer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品信息表';

-- 5. 产品批次表
CREATE TABLE `batches` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `batch_code` VARCHAR(100) NOT NULL UNIQUE COMMENT '批次编号',
  `product_id` INT NOT NULL COMMENT '所属产品ID',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '批次录入时间',
  `notes` TEXT NULL COMMENT '备注信息',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品批次表';

-- 6. 生长环境记录表
CREATE TABLE `environments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `batch_id` INT NOT NULL COMMENT '所属批次ID',
  `record_time` TIMESTAMP NOT NULL COMMENT '环境记录时间',
  `temperature` FLOAT NOT NULL COMMENT '温度（℃）',
  `humidity` FLOAT NOT NULL COMMENT '湿度（%）',
  `light` INT NOT NULL COMMENT '光照强度（lux）',
  `co2` FLOAT NOT NULL COMMENT '二氧化碳浓度（ppm）',
  `soil_ph` FLOAT NOT NULL COMMENT '土壤pH值',
  `notes` TEXT NULL COMMENT '附加说明',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生长环境记录表';

-- 7. 农事操作记录表
CREATE TABLE `actions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `batch_id` INT NOT NULL COMMENT '所属批次ID',
  `action_type` VARCHAR(100) NOT NULL COMMENT '操作类型',
  `description` TEXT NOT NULL COMMENT '操作详情说明',
  `image_url` VARCHAR(200) NULL COMMENT '操作照片URL',
  `operator_id` INT NOT NULL COMMENT '操作者用户ID',
  `record_time` TIMESTAMP NOT NULL COMMENT '操作时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`operator_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='农事操作记录表';

-- 8. 二维码信息表（添加qrcode_data_url字段）
CREATE TABLE `qrcodes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `qrcode_id` VARCHAR(100) NOT NULL UNIQUE COMMENT '唯一二维码ID',
  `batch_id` INT NOT NULL COMMENT '所属批次ID',
  `product_id` INT NOT NULL COMMENT '所属产品ID',
  `link` VARCHAR(200) NOT NULL COMMENT '二维码展示页面链接',
  `qrcode_data_url` LONGTEXT NULL COMMENT '二维码图片base64数据',
  `generate_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '二维码生成时间',
  `scan_count` INT NOT NULL DEFAULT 0 COMMENT '被扫码次数',
  `last_scan_time` TIMESTAMP NULL COMMENT '最近扫码时间',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '二维码状态（0未绑定、1正常、2失效等）',
  `expire_time` TIMESTAMP NULL COMMENT '有效期',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='二维码信息表';

-- 创建索引
CREATE INDEX `idx_users_role_id` ON `users`(`role_id`);
CREATE INDEX `idx_users_enterprise_id` ON `users`(`enterprise_id`);
CREATE INDEX `idx_products_producer_id` ON `products`(`producer_id`);
CREATE INDEX `idx_batches_product_id` ON `batches`(`product_id`);
CREATE INDEX `idx_environments_batch_id` ON `environments`(`batch_id`);
CREATE INDEX `idx_actions_batch_id` ON `actions`(`batch_id`);
CREATE INDEX `idx_actions_operator_id` ON `actions`(`operator_id`);
CREATE INDEX `idx_qrcodes_batch_id` ON `qrcodes`(`batch_id`);
CREATE INDEX `idx_qrcodes_product_id` ON `qrcodes`(`product_id`);
CREATE INDEX `idx_qrcodes_qrcode_id` ON `qrcodes`(`qrcode_id`); 