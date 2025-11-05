# 服务器部署说明

服务器 IP：`39.97.46.10`
账号名： FNA小程序
密码：ncpsy14014

## 本地构建镜像

```bash
cd /Users/csg/项目/traceability-system

# 构建后端镜像
docker build -t traceability-backend_v1 ./backend

# 推送到镜像仓库（Docker Hub 示例）
docker tag traceability-backend_v1 bucky1119/traceability-backend_v1
docker push bucky1119/traceability-backend_v1
```

## 服务器上部署

### 1. 准备部署目录

```bash
ssh user@39.97.46.10

mkdir -p /opt/traceability-system/backend/uploads
cd /opt/traceability-system
```

### 2. 上传配置文件

从本地上传 `docker-compose.yml`：

```bash
scp docker-compose.yml user@39.97.46.10:/opt/traceability-system/
```

### 3. 在服务器上配置环境变量

编辑 `docker-compose.yml`，将镜像地址改为你的仓库地址，并修改数据库密码：

```bash
nano docker-compose.yml
```

关键修改：
```yaml
backend:
  image: bucky1119/traceability-backend_v1  # 改为你的镜像地址
  environment:
    DB_PASSWORD: "your_strong_password"             # 改为强密码
```

### 4. 拉取镜像并启动

```bash
# 拉取镜像
docker pull bucky1119/traceability-backend_v1

# 启动服务
docker compose up -d

# 查看状态
docker compose ps
```

### 5. 验证部署

```bash
# 查看后端日志
docker compose logs -f traceability-backend

# 测试后端（在服务器上）
curl http://localhost:3000/api/docs

# 本地浏览器访问
# http://39.97.46.10:3000/api/docs
```

## 本地用 Navicat 访问服务器 MySQL

### 建立 SSH 隧道

在本地终端执行：

```bash
ssh -L 3307:localhost:3306 root@39.97.46.10
-L：表示本地端口转发（Local Port Forwarding），语法为 本地端口:目标主机:目标端口
若要后台运行该隧道（不占用终端），可添加 -fN 参数：
```
登录名：root
密码：ncpsy14014##

### 在 Navicat 中配置

- Host: `127.0.0.1`
- Port: `3306`
- Username: `root`
- Password: `docker-compose.yml` 中配置的 `DB_PASSWORD`

## 常用命令

```bash
# 查看日志
docker compose logs -f traceability-backend
docker compose logs -f traceability-mysql

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 进入 MySQL 容器
docker exec -it traceability-mysql mysql -uroot -p
```



# 1. 上传到服务器
scp docker-compose.yml user@39.97.46.10:/opt/traceability-system/
scp .env.example user@39.97.46.10:/opt/traceability-system/

# 2. 在服务器上
ssh user@39.97.46.10
cd /opt/traceability-system

# 3. 复制并配置环境变量
cp .env.example .env
nano .env  # 修改数据库密码等（可选，默认已有）

# 4. 拉取镜像并启动
docker compose pull
docker compose up -d

# 5. 验证
docker compose ps
curl http://localhost:3000/api/docs
http://39.97.46.10:3000/api/docs