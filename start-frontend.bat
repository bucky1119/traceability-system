@echo off
echo 正在启动设施蔬菜溯源系统前端服务...
echo.

cd web-admin

echo 1. 检查依赖包...
if not exist node_modules (
    echo 安装依赖包...
    npm install
) else (
    echo 依赖包已存在
)

echo.
echo 2. 启动前端服务...
npm start

pause 