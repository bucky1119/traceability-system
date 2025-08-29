-- 添加二维码图片存储相关字段
USE `traceability_system`;

-- 添加二维码图片存储字段
ALTER TABLE `qrcodes` 
ADD COLUMN `qrcode_image_url` VARCHAR(500) NULL COMMENT '二维码图片访问URL' AFTER `qrcode_data_url`,
ADD COLUMN `qrcode_image_path` VARCHAR(500) NULL COMMENT '二维码图片文件路径' AFTER `qrcode_image_url`,
ADD COLUMN `qrcode_image_size` INT NULL COMMENT '二维码图片文件大小（字节）' AFTER `qrcode_image_path`;

-- 创建索引以提高查询性能
CREATE INDEX `idx_qrcodes_image_url` ON `qrcodes`(`qrcode_image_url`); 