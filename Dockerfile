FROM node:16-alpine

# 更改安装源
# RUN echo "http://mirrors.aliyun.com/alpine/v3.9/main/" > /etc/apk/repositories


# 创建工作目录, 进入工作目录
# RUN mkdir -p /app
WORKDIR /app


# 拷贝依赖配置, 安装依赖 (依赖配置没有修改, 可以利用缓存加速构建)
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm --registry=https://registry.npm.taobao.org && \
  pnpm install

# 复制项目代码, 执行构建
COPY . .
RUN pnpm run build:webpack

COPY /dist ./dist


# 设置环境变量, 设置 HOST, 设置外部访问端口
ENV NODE_ENV=production
ENV HOST 0.0.0.0
EXPOSE 3000


#  执行运行
# CMD ["npm", "run" "start:prod"]
ENTRYPOINT npm run start:prod
