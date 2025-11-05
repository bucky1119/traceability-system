# 使用官方的 Node.js 18 Alpine 镜像作为基础镜像
# Alpine 镜像是轻量级的，可以减小最终镜像的大小
FROM node:18

# 在容器内设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json (如果存在) 到工作目录
# 将这些文件分开复制可以利用 Docker 的缓存机制，
# 只有在这些文件发生变化时才重新安装依赖
COPY package*.json ./

# 安装项目的所有依赖 (包括 devDependencies 用于构建)
RUN npm install

# 将项目的所有文件复制到工作目录
# 这包括 src, tsconfig.json 等所有构建所需的文件
COPY . .

# 执行构建命令，将 TypeScript 编译成 JavaScript
# 编译后的文件会输出到 dist 目录
RUN npm run build

# 从 node_modules 中移除开发依赖，减小镜像体积
# RUN npm prune --production

# 暴露应用程序运行的端口
EXPOSE 3000

# 定义容器启动时执行的命令
# 'node dist/main' 会启动 NestJS 应用
CMD [ "node", "dist/main" ]
