#!/bin/bash

# 设施蔬菜溯源系统后端启动脚本

echo "正在启动设施蔬菜溯源系统后端服务..."

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "警告: 未找到.env文件，请确保已配置环境变量"
fi

# 安装依赖
echo "安装依赖包..."
npm install

# 构建项目
echo "构建项目..."
npm run build

# 启动开发服务器
echo "启动开发服务器..."
npm run start:dev 