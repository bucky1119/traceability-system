-- 修改qrcodes表的link字段为LONGTEXT类型，以支持存储完整的溯源信息JSON
USE `traceability_system`;


-- 更新字段注释
ALTER TABLE `qrcodes` MODIFY COLUMN `link` LONGTEXT NOT NULL COMMENT '二维码溯源信息JSON数据（包含产品、批次、生产者等完整信息）'; 