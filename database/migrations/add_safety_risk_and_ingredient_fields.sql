-- 添加安全风险因子检测和产品成分检测字段
-- 执行时间: 2024-01-01

-- 为products表添加新字段
ALTER TABLE products 
ADD COLUMN safety_risk_test VARCHAR(500) NULL COMMENT '安全风险因子检测',
ADD COLUMN ingredient_test VARCHAR(500) NULL COMMENT '产品成分检测',
ADD COLUMN created_by INT NULL COMMENT '录入者ID（管理员录入时使用）';

-- 添加外键约束
ALTER TABLE products 
ADD CONSTRAINT fk_products_created_by 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- 添加索引以提高查询性能
CREATE INDEX idx_products_safety_risk_test ON products(safety_risk_test);
CREATE INDEX idx_products_ingredient_test ON products(ingredient_test);
CREATE INDEX idx_products_created_by ON products(created_by);

-- 更新现有记录的created_by字段（如果有的话）
-- UPDATE products SET created_by = producer_id WHERE created_by IS NULL; 