#!/bin/bash

echo "========================================"
echo "设施蔬菜溯源系统启动脚本"
echo "========================================"
echo

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: 未找到npm，请先安装npm"
    exit 1
fi

echo "正在启动后端服务..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

echo "等待后端服务启动..."
sleep 5

echo "正在启动Web管理后台..."
cd web-admin
npm start &
WEB_PID=$!
cd ..

echo
echo "========================================"
echo "系统启动完成！"
echo "========================================"
echo "后端服务: http://localhost:3000"
echo "Web管理后台: http://localhost:3001"
echo "微信小程序: 请在微信开发者工具中打开"
echo
echo "按Ctrl+C停止所有服务"

# 等待用户中断
trap "echo '正在停止服务...'; kill $BACKEND_PID $WEB_PID 2>/dev/null; exit" INT
wait 