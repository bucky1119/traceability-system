@echo off
echo 正在启动设施蔬菜溯源系统后端服务...
echo.

cd backend

echo 1. 检查依赖包...
if not exist node_modules (
    echo 安装依赖包...
    npm install
) else (
    echo 依赖包已存在
)

echo.
echo 2. 初始化数据库...
npm run db:init

echo.
echo 3. 启动后端服务...
npm run start:dev

pause 