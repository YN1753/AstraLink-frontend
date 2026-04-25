# ============================================
# AstraLink Frontend Dockerfile
# Multi-stage build with Nginx
# ============================================

# ============================================
# 构建阶段
# ============================================
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖（利用 Docker 缓存）
RUN npm ci --only=production=false

# 复制源代码
COPY . .

# 设置环境变量
ENV NODE_ENV=production

# 构建生产版本
RUN npm run build

# ============================================
# 运行阶段 - Nginx
# ============================================
FROM nginx:alpine

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 创建静态资源目录（以防万一）
RUN mkdir -p /usr/share/nginx/html/data

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:3000 || exit 1

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
