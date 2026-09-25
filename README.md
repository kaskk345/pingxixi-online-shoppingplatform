# 在线购物系统（挑战升级）

> 一个小众定制商品的「单品单卖」直销系统：全站在售商品**有且仅有一件**，卖出后再制作下一件；只有一个卖家；买家**无需注册**，购买时才填写用户信息；交易在**线下**完成；交易前商品**冻结**，成功则撤下、失败则恢复上线。

## 项目概览

- 项目类型：软件工程课程设计（Scrum 迭代式增量开发）
- 开发方式：Scrum，2 周一个 Sprint
- 基线需求（MVP）：单品单卖、单一卖家、无注册、线下交易、交易前冻结（成功撤下 / 失败恢复）、卖家后台
- 升级方向：商品 / 价格 / 营销 / 客户 / 订单 / 评价 / 库存 / 商家 / 配送 / 权限 / 支付管理，以及微信小程序端

## 业务特色（本项目挑战点）

| 特色 | 设计挑战 |
| --- | --- |
| 单品单卖（在售商品恒为 0 或 1 件） | 商品状态机（在售/冻结/售出/制作中）严格唯一 |
| 无注册，购买时才填信息 | 无账号体系下的身份识别与防刷单 |
| 线下交易 | 无在线支付流水，交易结果依赖卖家登记，需可追溯 |
| 交易前冻结商品 | 冻结/恢复的并发控制与超时自动释放 |

## 技术栈

| 层 | 技术 | 版本 |
| --- | --- | --- |
| 后端 | Java + Spring Boot | 3.x |
| ORM | Spring Data JPA / MyBatis-Plus | — |
| 数据库 | MySQL | 8.x |
| 前端 | Vue 3 + Vite | 3.x |
| UI 组件库 | Element Plus | — |
| HTTP 客户端 | Axios | — |
| 缓存 | Redis（可选，用于超时释放与限流） | 6.x |

## 项目结构

```
.
├── backend/                    # 后端（Spring Boot，Maven 多模块或单模块）
│   ├── src/main/java/com/xxx/mall/
│   │   ├── controller/         # 控制器层
│   │   ├── service/            # 业务层
│   │   ├── mapper/             # 数据访问层
│   │   ├── entity/             # 实体
│   │   ├── dto/                # 数据传输对象
│   │   └── common/             # 统一返回、异常、工具
│   ├── src/main/resources/
│   │   ├── application.yml     # 配置
│   │   └── db/init.sql         # 数据库初始化脚本
│   └── pom.xml
├── frontend/                   # 前端（Vue 3 + Vite）
│   ├── src/
│   │   ├── api/                # 接口封装
│   │   ├── views/              # 页面
│   │   ├── router/             # 路由
│   │   ├── store/              # 状态管理（Pinia）
│   │   └── components/         # 公共组件
│   └── package.json
├── docs/                       # 项目文档
│   ├── 产品订单_ProductBacklog.md
│   ├── 图1_在线购物系统功能结构图.png
│   ├── 图2_在线购物系统用例图.png
│   └── 图3_买家购买商品业务流程图.png
└── README.md
```

## 环境要求

- JDK 17+、Maven 3.8+
- MySQL 8.x
- Node.js 18+、npm 9+
- （可选）Redis 6.x

## 快速开始

> 默认使用 H2 内存数据库，**无需安装 MySQL**，clone 后即可运行；切换 MySQL 见下文「切换数据库」。

### 1. 启动后端

```bash
cd backend
mvn spring-boot:run
# 后端默认地址 http://localhost:8080
# 启动时自动初始化默认卖家账号与示例商品
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
# 前端默认地址 http://localhost:5173
```

浏览器访问 `http://localhost:5173` 即可体验买家端；卖家后台入口在页面右上角。

### 默认账号

| 角色 | 账号 | 密码 |
| --- | --- | --- |
| 卖家（店主） | `admin` | `admin123` |

### 切换数据库（可选，MySQL 8.x）

1. 取消 `backend/pom.xml` 中 `mysql-connector-j` 依赖的注释；
2. 新建数据库并修改 `backend/src/main/resources/application.yml` 的 `spring.datasource` 为 MySQL 连接串；
3. 将 `spring.jpa.hibernate.ddl-auto` 改为 `update`（首次运行后建表）。

## 核心接口一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/products/on-sale` | 买家查看当前在售商品 |
| GET | `/api/products/{id}` | 商品详情 |
| POST | `/api/intents` | 买家提交购买意向 |
| GET | `/api/intents/query` | 买家查询意向进度 |
| POST | `/api/seller/login` | 卖家登录（返回 token） |
| GET | `/api/seller/products` | 卖家商品列表（含历史） |
| POST | `/api/seller/products` | 发布商品 |
| POST | `/api/seller/products/{id}/freeze` | 冻结商品 |
| POST | `/api/seller/products/{id}/restore` | 恢复商品上线 |
| POST | `/api/seller/products/{id}/off-shelf` | 下架商品 |
| GET | `/api/seller/intents` | 意向购买人列表 |
| POST | `/api/seller/intents/{id}/accept` | 同意意向（自动冻结） |
| POST | `/api/seller/intents/{id}/succeed` | 成交登记（撤下商品） |
| POST | `/api/seller/intents/{id}/fail` | 失败登记（恢复上线） |
| PUT | `/api/seller/password` | 修改密码 |
| POST | `/api/seller/upload` | 上传商品图片 |

## Git 协作规范

### 分支规范

| 分支 | 用途 |
| --- | --- |
| `main` | 稳定分支，可随时演示/发布 |
| `develop` | 集成开发分支 |
| `feature/<需求编号>` | 功能分支，如 `feature/US-01-01` |
| `bugfix/<编号>` | 缺陷修复分支 |
| `release/<版本号>` | 发布准备分支 |

### 提交规范（Conventional Commits）

```
feat(商品): 新增商品发布接口
fix(订单): 修复冻结超时未释放问题
docs: 更新产品订单
chore: 调整 .gitignore
```

提交信息格式：`<type>(<scope>): <subject>`，type 取 `feat / fix / docs / refactor / test / chore`。

### 协作流程

1. 从 `develop` 拉取最新代码，切出 `feature/<需求编号>` 分支
2. 本地开发并自测通过
3. 提交后推送，发起 Pull Request 到 `develop`
4. 至少 1 名成员 Code Review 通过后合并
5. Sprint 结束时 `develop` 合并到 `main`，打 tag 作为版本

## 项目成员

| 姓名 | 邮箱 |
| --- | --- |
| （待填写） | 22800257@qq.com |
| （待填写） | 3396556354@qq.com |

## 相关文档

- [产品订单（Product Backlog）](docs/产品订单_ProductBacklog.md)
- 图 1 功能结构图、图 2 用例图、图 3 业务流程图（见 `docs/`）
