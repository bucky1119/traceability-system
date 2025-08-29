-- 设施蔬菜溯源系统初始数据
-- 创建时间: 2024-01-01
-- 版本: 1.0.0

USE `traceability_system`;

-- 插入默认角色
INSERT INTO `roles` (`name`, `description`, `type`) VALUES
('系统管理员', '拥有系统所有权限的管理员', 'admin'),
('生产者', '负责记录农事操作和生产环境数据', 'producer'),
('消费者', '扫码查看产品溯源信息的用户', 'consumer');

-- 插入示例企业
INSERT INTO `enterprises` (`name`, `contacts`, `tel`, `license`, `address`) VALUES
('绿色蔬菜种植基地', '张三', '13800138001', 'L123456789', '北京市朝阳区绿色农业园区A区'),
('有机农场合作社', '李四', '13800138002', 'L987654321', '上海市浦东新区有机农业示范区'),
('生态农业科技公司', '王五', '13800138003', 'L456789123', '广州市白云区生态农业科技园');

-- 插入默认管理员用户 (密码: admin123)
INSERT INTO `users` (`username`, `password`, `tel`, `role_id`, `enterprise_id`) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '13800138000', 1, NULL);

-- 插入示例生产者用户 (密码: producer123)
INSERT INTO `users` (`username`, `password`, `tel`, `role_id`, `enterprise_id`) VALUES
('producer1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '13800138001', 2, 1),
('producer2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '13800138002', 2, 2);

-- 插入示例产品
INSERT INTO `products` (`name`, `producer_id`, `origin`, `planting_date`, `harvest_date`, `test_type`, `test_date`, `is_qualified`,'producer_name','producer_tel','producer_enterprise') VALUES
('有机黄瓜', 2, '北京市朝阳区绿色农业园区', '2024-01-15', '2024-03-15', '农残检测', '2024-03-10', TRUE,'张三','13800138001','绿色蔬菜种植基地' ),
('无公害番茄', 3, '上海市浦东新区有机农业示范区', '2024-02-01', '2024-04-01', '重金属检测', '2024-03-25', TRUE,'李四','13800138002','有机农场合作社'),
('生态生菜', 2, '北京市朝阳区绿色农业园区', '2024-01-20', '2024-03-20', '农残检测', '2024-03-15', TRUE,'王五','13800138003','生态农业科技公司');

-- 插入示例批次
INSERT INTO `batches` (`batch_code`, `product_id`, `notes`) VALUES
('202401001', 1, '春季第一批有机黄瓜'),
('202402001', 2, '春季第一批无公害番茄'),
('202401002', 3, '春季第一批生态生菜');

-- 插入示例环境记录
INSERT INTO `environments` (`batch_id`, `record_time`, `temperature`, `humidity`, `light`, `co2`, `soil_ph`, `notes`) VALUES
(1, '2024-01-20 08:00:00', 25.5, 65.2, 1200, 400.5, 6.8, '正常生长环境'),
(1, '2024-01-21 08:00:00', 26.1, 64.8, 1250, 405.2, 6.8, '正常生长环境'),
(2, '2024-02-05 08:00:00', 24.8, 68.5, 1100, 395.8, 7.0, '正常生长环境'),
(3, '2024-01-25 08:00:00', 25.2, 66.1, 1150, 402.1, 6.9, '正常生长环境');

-- 插入示例农事操作
INSERT INTO `actions` (`batch_id`, `action_type`, `description`, `operator_id`, `record_time`) VALUES
(1, 'planting', '播种有机黄瓜种子，采用穴盘育苗方式', 2, '2024-01-15 09:00:00'),
(1, 'watering', '浇水，保持土壤湿润', 2, '2024-01-16 08:30:00'),
(1, 'fertilizing', '施用有机肥料，促进幼苗生长', 2, '2024-01-20 10:00:00'),
(2, 'planting', '播种无公害番茄种子', 3, '2024-02-01 09:00:00'),
(2, 'watering', '浇水，保持土壤湿度', 3, '2024-02-02 08:30:00'),
(3, 'planting', '播种生态生菜种子', 2, '2024-01-20 09:00:00');

-- 插入示例二维码
INSERT INTO `qrcodes` (`qrcode_id`, `batch_id`, `product_id`, `link`, `status`,) VALUES
('QR001', 1, 1, 'https://your-domain.com/trace/QR001', 1),
('QR002', 2, 2, 'https://your-domain.com/trace/QR002', 1),
('QR003', 3, 3, 'https://your-domain.com/trace/QR003', 1); 