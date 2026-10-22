# 拼西西在线购物平台 —— 单镜像 Docker 构建（方案 A）
# 思路：把前端构建产物并入后端 Spring Boot 可执行 jar 的 static 目录，
#       由后端统一托管，最终一个容器同时提供前端页面与后端 API（均监听 8080）。
# 适用：验收标准中「部署 → Docker 镜像」条目。
#
# 构建（在项目根目录执行，需 Docker 守护进程已运行）：
#   docker build -t pingxixi:0.1.0 .
# 运行：
#   docker run -p 8080:8080 pingxixi:0.1.0
# 访问：http://localhost:8080  （买家端首页 / 卖家后台 /api 同端口）
#
# 说明：
#  - 前端 axios baseURL 为相对路径 '/api'，同源 8080 下无需代理，方案 A 可直接工作。
#  - 前端使用 history 路由，刷新 /seller/products 等子路径可能 404；
#    若需完美支持，可在后端 WebConfig 增加「未知路径返回 index.html」的转发，或改为 hash 路由。
#  - npm 与 Maven 均使用国内镜像源，避免容器内访问官方源出现 ECONNRESET / 超时。

# ---------- 阶段 1：构建前端 ----------
# 依赖中存在要求 Node >= 22 的包（@vueuse/*），故使用 node:22-alpine
FROM node:22-alpine AS frontend
WORKDIR /build/frontend
COPY frontend/package*.json ./
# 切换 npm 国内镜像源后安装，规避 registry.npmjs.org 连接被重置
RUN npm config set registry https://registry.npmmirror.com \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm ci --no-audit --no-fund
COPY frontend/ .
RUN npm run build

# ---------- 阶段 2：构建后端（并入前端静态资源） ----------
FROM maven:3.9-eclipse-temurin-17 AS backend
WORKDIR /build/backend
COPY backend/ .
# 将前端产物放入后端 classpath 下的 static 目录，由 Spring Boot 自动托管
COPY --from=frontend /build/frontend/dist ./src/main/resources/static
# 配置阿里云 Maven 镜像，加速依赖下载
RUN mkdir -p /root/.m2 \
    && printf '%s\n' \
    '<settings>' \
    '  <mirrors>' \
    '    <mirror>' \
    '      <id>aliyunmaven</id>' \
    '      <mirrorOf>central</mirrorOf>' \
    '      <url>https://maven.aliyun.com/repository/public</url>' \
    '    </mirror>' \
    '  </mirrors>' \
    '</settings>' > /root/.m2/settings.xml \
    && mvn -B -DskipTests clean package

# ---------- 阶段 3：运行 ----------
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=backend /build/backend/target/mall-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
