@echo off
chcp 65001
echo 正在启动设施蔬菜溯源系统后端服务...

REM 检查环境变量文件
if not exist .env (
    echo 警告: 未找到.env文件，请确保已配置环境变量
)

REM 安装依赖
echo 安装依赖包...
call npm install

REM 构建项目
echo 构建项目...
call npm run build

REM 启动开发服务器
echo 启动开发服务器...
call npm run start:dev

pause 