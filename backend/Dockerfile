# ---- Base image ----
FROM node:18 AS base

# Set working directory
WORKDIR /app

# 替换 apk 为 apt：先更新包索引，再安装 bash 和 curl（--no-install-recommends 减少冗余依赖）
RUN apt update && apt install -y --no-install-recommends bash curl \
    && rm -rf /var/lib/apt/lists/*  # 清理 apt 缓存，减少镜像体积

# ---- Dependencies (builder) ----
FROM base AS deps

# Install dependencies separately to leverage Docker cache
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Build ----
FROM deps AS build

# Copy source
COPY tsconfig.json ./tsconfig.json
COPY src ./src

# Build to dist/
RUN npm run build

# ---- Production runtime ----
FROM node:18 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system app && adduser --system --ingroup app app

# Copy only necessary files
COPY package.json package-lock.json* ./
# Install only production deps
RUN npm ci --omit=dev && npm cache clean --force

# Copy build output
COPY --from=build /app/dist ./dist

# Static uploads directory (served by Nest + ServeStaticModule)
RUN mkdir -p /app/uploads && chown -R app:app /app
VOLUME ["/app/uploads"]

# Expose port (NestJS default from main.ts)
EXPOSE 3000

# Switch to non-root
USER app

# Default command
CMD ["node", "dist/main.js"]
