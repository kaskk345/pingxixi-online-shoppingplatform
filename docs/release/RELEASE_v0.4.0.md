## v0.4.0 挑战 B 首批：订单闭环与商品预选

| 项目 | 内容 |
| --- | --- |
| 版本号 | `v0.4.0` |
| 需求范围 | 挑战 B 首批 7 条（B.1 订单升级 3 条 + B.2 商品预选升级 4 条） |
| 交付基线 | `v0.3.0`（`b3744a3`） |
| 验收功能提交 | `4d6085b`（feat(订单): 新增 B.1 订单五状态流转与 B.2 收藏/购物车多件下单） |
| 文档提交 | `e58b0b5`（评审报告）· `9a90786`（讲述版 PPT）· `18c359e`（评审结果归纳）· `83fdc0d`（Wiki 导航） |
| 发布日期 | 2026-11-27 |
| 变更规模 | 33 个文件，+2196 / −28；新增 23 个接口、4 张表、1 个状态枚举、4 个页面 |
| Docker 镜像 | `pingxixi:0.4.0`（方案 A 单镜像，544 MB，`linux/amd64`） |
| 交付物 | 源码包 + `pingxixi-0.4.0.tar`（153.0 MB） |

> main 分支在 `4d6085b` 之后另有挑战 C 提交 `da58f87`（C.1 线上支付 / C.2 配送物流 / C.3 售后服务），属后续迭代，不计入本版本。

---

## 一、需求对照

### B.1 订单升级

| 编号 | 需求原文 | 实现要点 | 落点 | 结论 |
| --- | --- | --- | --- | --- |
| B.1-1 | 订单包括客户下单、商家确认、备货完成、开始发货、交易完成 5 个状态 | `OrderStatus` 五状态 + `CANCELED` 终态；卖家按序推进，跨状态被拒绝 | `entity/enums/OrderStatus.java`；`POST /api/seller/orders/{id}/confirm\|prepare\|ship\|complete` | 满足 |
| B.1-2 | 开始发货状态前，客户可以取消订单 | 仅 `PLACED` / `CONFIRMED` / `PREPARED` 可取消 | `POST /api/customer/orders/{id}/cancel`；`OrderStatus#cancellableByCustomer()` | 满足 |
| B.1-3 | 交易完成状态前，商家可以取消订单 | 除 `COMPLETED` / `CANCELED` 外均可取消，记录取消方与原因 | `POST /api/seller/orders/{id}/cancel`；`OrderStatus#cancellableBySeller()` | 满足 |

### B.2 商品预选升级

| 编号 | 需求原文 | 实现要点 | 落点 | 结论 |
| --- | --- | --- | --- | --- |
| B.2-1 | 客户可以收藏商品 | 收藏 / 取消收藏 / 是否已收藏 / 收藏列表；`(customerId, productId)` 唯一 | `FavoriteController`；`/favorites` 页面 | 满足 |
| B.2-2 | 客户可以选择商品进入购物车 | 加购、改数量、删除、清空、角标计数 | `CartController`；`/cart` 页面 | 满足 |
| B.2-3 | 客户可以从购物车中选择多件商品进行下单 | 勾选多件合并为一个订单，明细价格快照、库存扣减、购物车清理同一事务 | `POST /api/customer/cart/checkout`；`OrderService#checkoutFromCart` | 满足 |
| B.2-4 | 客户可以从购物车中选择多件商品转为收藏 | 勾选多件批量转收藏 | `POST /api/customer/cart/to-favorites` | 满足 |

---

## 二、B.1 订单升级

### 2.1 五状态流转

| 当前状态 | 含义 | 可流转到 |
| --- | --- | --- |
| `PLACED` | 客户下单，库存已扣减 | 商家确认 / 客户取消 / 商家取消 |
| `CONFIRMED` | 商家接单 | 备货完成 / 客户取消 / 商家取消 |
| `PREPARED` | 商品已备好 | 开始发货 / 客户取消 / 商家取消 |
| `SHIPPED` | 已发出，客户不可再取消 | 交易完成 / 商家取消 |
| `COMPLETED` | 终态，累计销量 | 无 |
| `CANCELED` | 终态，记录取消方与原因，库存回滚 | 无 |

### 2.2 两条取消规则

- **客户取消**：仅 `PLACED` / `CONFIRMED` / `PREPARED` 三个状态可取消；`SHIPPED` 起提示「订单已开始发货，无法取消」。
- **商家取消**：`COMPLETED` / `CANCELED` 之外均可取消，需填写取消原因；`COMPLETED` 提示「订单已交易完成，无法取消」。
- **统一入口** `OrderService.doCancel`：写入 `canceledAt / canceledBy / cancelReason`，再按订单明细把 `quantity` 加回对应商品库存；商品若此前因库存归零自动下架，库存恢复为正数时重新上架；**销量只在交易完成时累加，取消不扣减销量**。

### 2.3 下单事务：一次请求完成 5 件事

```java
@Transactional
public OrderView checkoutFromCart(customerId, itemIds, buyerName, ...) {
    // 1. 校验购物车条目属于当前客户
    // 2. 逐项校验商品可购买 + 库存充足
    // 3. 扣减库存；库存归零自动下架
    // 4. 生成 Order + OrderItem（价格快照）
    // 5. 删除已下单的购物车条目
}
```

- 任一步失败抛 `BizException`，事务整体回滚，不会出现「订单生成了但库存没扣」或「库存扣了但订单没生成」。
- 商品实体保留 `@Version` 乐观锁，并发修改由 JPA 校验版本。
- **下单即扣库存**（而非发货时扣），保证「订单成立 = 库存已锁定」，与既有意向预占的库存口径一致。

### 2.4 快照与订单号

- `OrderItem` 保存**名称 / 图片 / 单价快照**，卖家后续改价、改名不影响历史订单金额。
- `Order` 记录 `createdAt / confirmedAt / preparedAt / shippedAt / completedAt / canceledAt`，状态变化全程可追溯。
- 订单号规则：`SO + yyyyMMddHHmmss + 4 位随机数`，数据库唯一约束兜底，冲突自动重试。

---

## 三、B.2 商品预选升级

### 3.1 收藏（`/favorites`）

- 收藏关系只存 `(customerId, productId)`，重复收藏不新增记录（实测重复收藏后总数不变）。
- 收藏列表联表读取商品**当前**价格、库存与状态，避免商品改价后显示过期价格。
- 商品不可购买时「加入购物车」置灰，但仍可取消收藏。
- 商品详情页提供「收藏 / 已收藏」切换；首页商品卡提供快捷收藏入口。

### 3.2 购物车（`/cart`）

- 同一客户同一商品只保留一条记录，重复加入累加数量。
- 数量步进器即时校验：超过库存返回「库存不足，仅剩 N 件」；超过单件上限返回「单件商品最多购买 99 件」。
- 支持修改数量、删除单条、清空购物车；不可购买商品的条目标记为「不可购买」，不可勾选结算。

### 3.3 多件商品合并下单

- 勾选多件 → 结算弹窗（默认带出客户资料，可改收货人、电话、交易地点、备注）→ 生成**一个订单 + N 条订单明细**。
- 下单成功后对应购物车条目自动删除，跳转「我的订单」，返回订单号便于核对。
- 总金额为各明细小计之和，价格为下单时快照；下单同时扣减各商品库存，库存归零自动下架。

### 3.4 购物车批量转收藏

```http
POST /api/customer/cart/to-favorites
Body: { "itemIds": [12, 13, 14] }
Response: 3   // 实际转移条数
```

- 勾选多条后一键转收藏：已在收藏中的商品跳过创建，但同样从购物车移除。
- 与多件下单共用同一套勾选结果：现在买 → 合并下单；以后再买 → 批量转收藏。

---

## 四、数据模型

| 实体 | 表名 | 关键字段 |
| --- | --- | --- |
| `Order` | `mall_order` | `orderNo`（唯一）、`customerId`、`buyerName`、`buyerPhone`、`address`、`remark`、`totalAmount`、`itemCount`、`status`、`canceledBy`、`cancelReason`、各节点时间 |
| `OrderItem` | `order_item` | `orderId`、`productId`、`productName`、`productImage`、`price`、`quantity`、`subtotal` |
| `CartItem` | `cart_item` | `customerId + productId` 唯一、`quantity` |
| `Favorite` | `favorite` | `customerId + productId` 唯一 |

---

## 五、接口清单（本版本新增 23 个）

### 5.1 客户订单（3 个）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/customer/orders` | 订单列表（含明细、节点时间、可取消标记） |
| GET | `/api/customer/orders/{id}` | 订单详情（仅本人，按 `customerId` 过滤） |
| POST | `/api/customer/orders/{id}/cancel` | 取消订单（开始发货前） |

### 5.2 卖家订单（7 个）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/seller/orders` | 订单列表（`status` 筛选 + 分页） |
| GET | `/api/seller/orders/{id}` | 订单详情 |
| POST | `/api/seller/orders/{id}/confirm` | `PLACED → CONFIRMED` |
| POST | `/api/seller/orders/{id}/prepare` | `CONFIRMED → PREPARED` |
| POST | `/api/seller/orders/{id}/ship` | `PREPARED → SHIPPED` |
| POST | `/api/seller/orders/{id}/complete` | `SHIPPED → COMPLETED` |
| POST | `/api/seller/orders/{id}/cancel` | 取消订单（交易完成前） |

### 5.3 购物车（8 个）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/customer/cart` | 购物车列表（含不可购买标记） |
| GET | `/api/customer/cart/count` | 角标计数 |
| POST | `/api/customer/cart` | 加入购物车（同商品累加） |
| PUT | `/api/customer/cart/{id}` | 修改数量（校验库存与单件上限） |
| DELETE | `/api/customer/cart/{id}` | 删除单条 |
| DELETE | `/api/customer/cart` | 清空购物车 |
| POST | `/api/customer/cart/checkout` | 勾选多件合并下单 |
| POST | `/api/customer/cart/to-favorites` | 勾选多件批量转收藏 |

### 5.4 收藏（5 个）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/customer/favorites` | 收藏列表（联表取当前价格 / 库存 / 状态） |
| GET | `/api/customer/favorites/count` | 收藏数 |
| GET | `/api/customer/favorites/check` | 是否已收藏 |
| POST | `/api/customer/favorites` | 收藏（幂等，不产生重复记录） |
| DELETE | `/api/customer/favorites/{productId}` | 取消收藏 |

鉴权沿用现有拦截器：`/api/customer/**` 校验客户 token，`/api/seller/**` 校验卖家 token，未携带返回 HTTP 401。

---

## 六、页面与交互

| 页面 | 路由 | 要点 |
| --- | --- | --- |
| 卖家订单管理 | `/seller/orders` | 五状态 + 已取消筛选；操作列按当前状态只显示唯一「下一步」按钮（确认 / 备货完成 / 开始发货 / 交易完成），避免跳步；交易完成前显示「取消订单」，弹窗填原因；详情弹窗展示五节点进度、收货信息、明细与合计 |
| 客户订单 | `/customer/orders` | 七页签（全部 + 五状态 + 已取消）；展开行显示五节点时间轴、明细、收货信息；「取消订单」仅前三个状态出现，二次确认可填原因；已取消订单保留明细并显示取消方与原因 |
| 购物车 | `/cart` | 勾选、数量步进（实时校验库存与单件上限）、汇总件数与金额、删除、清空、批量转收藏、结算弹窗 |
| 收藏夹 | `/favorites` | 收藏列表展示实时价格 / 库存 / 可购买状态，可一键加购或取消收藏 |

页面截图见仓库 `docs/wiki/screenshots/`：`15-cart.png`、`16-favorites.png`、`17-customer-orders.png`、`18-seller-orders.png`。

---

## 七、边界与一致性验证

| 验证项 | 实测输入 | 结果 |
| --- | --- | --- |
| 数量超过单件上限 | 购物车加入 999 件 | `code=1`「单件商品最多购买 99 件」 |
| 数量超过库存 | 加入 50 件（库存 8） | `code=1`「库存不足，仅剩 8 件」 |
| 不可购买商品加购 | 已下架商品 | `code=1`「商品当前不可购买」 |
| 空勾选下单 | `itemIds=[]` | `code=1`「请选择要下单的商品」 |
| 空勾选转收藏 | `itemIds=[]` | `code=1`「请选择商品」 |
| 重复收藏 | 再次收藏同一商品 | 收藏总数不变，不产生重复记录 |
| 发货后客户取消 | `SHIPPED` 订单 | `code=1`「订单已开始发货，无法取消」，状态不变 |
| 交易完成后商家取消 | `COMPLETED` 订单 | `code=1`「订单已交易完成，无法取消」 |
| 重复取消 | `CANCELED` 订单 | `code=1`「订单已取消，无需重复操作」 |
| 未登录访问客户接口 | 不带 `X-Token` | HTTP 401 |
| 客户访问他人订单 | 他人订单 ID | 「订单不存在」（按 `customerId` 过滤） |

主链路实测记录：

```text
POST /api/customer/cart/checkout  { itemIds:[钱包, 马克杯], ... }
→ orderNo = SO202611091353017504
  status  = PLACED   totalAmount = 258.00   items = 2
POST /api/seller/orders/{id}/confirm → CONFIRMED
POST /api/seller/orders/{id}/prepare → PREPARED
POST /api/seller/orders/{id}/ship    → SHIPPED
POST /api/customer/orders/{id}/cancel
→ code=1  「订单已开始发货，无法取消」（状态保持 SHIPPED）
POST /api/seller/orders/{id}/complete → COMPLETED，商品 sales +1
```

另一笔订单在 `PLACED` 由客户取消：变为 `CANCELED`，商品库存 `0 → 1`，状态恢复在售；再一笔在 `CONFIRMED` 由商家取消，`canceledBy=SELLER`，取消原因与库存回滚均符合预期。

---

## 八、构建与容器验证

| 项目 | 命令 | 结果 |
| --- | --- | --- |
| 后端 | `cd backend && mvn -B -DskipTests package` | BUILD SUCCESS |
| 前端 | `cd frontend && npm run build` | 构建成功，产出 `dist/` |
| 镜像 | `docker build -t pingxixi:0.4.0 .` | 成功，Maven 阶段约 2 分 30 秒，整体约 3 分钟 |

镜像方案 A（单镜像）：前端 `dist` 并入后端 jar 的 `static` 目录，由 Spring Boot 统一托管，页面与 API 同端口 8080。三阶段构建：`node:22-alpine`（`npm ci` + build）→ `maven:3.9-eclipse-temurin-17`（并入 dist 后 package）→ `eclipse-temurin:17-jre`（仅拷贝 jar）。`.dockerignore` 已排除 `.git`、`node_modules`、`dist`、`target`、`uploads`、`docs`、`*.log`。

容器验证（映射 `8081:8080` 避免与本机开发服务冲突）：

| 验证项 | 操作 | 结果 |
| --- | --- | --- |
| 容器状态 | `docker ps` | `Up`，`0.0.0.0:8081->8080/tcp` |
| 前端首页 | `GET http://localhost:8081/` | HTTP 200，409 字节，含 `<div id="app">` |
| 商品接口 | `GET /api/products/search` | `code=0`，返回 2 条在售商品 |
| 卖家登录 | `POST /api/seller/login` | `code=0`，返回 32 位 token |
| 启动日志 | `docker logs` | Spring Boot 正常启动，H2 初始化与 SQL 执行无异常堆栈 |

---

## 九、交付物

| 成果物 | 位置 |
| --- | --- |
| 源码包 | Source code (zip / tar.gz)，本页底部自动生成 |
| 验收基线源码 zip | `https://github.com/kaskk345/pingxixi-online-shoppingplatform/archive/refs/tags/v0.4.0.zip` |
| Docker 镜像 tar | `pingxixi-0.4.0.tar`，153.0 MB（本页 Assets） |
| 镜像 ID | `sha256:fdea54cba8edb900578625d32760ca4a3174919fa6df433a7bc390671dd5f2ac` |
| tar SHA-256 | `E3E8A746FC2B3765903F3156C69A121BA8F41F0E1187DB3B0C5A6542D4F805BC` |
| 镜像平台 / 大小 | `linux/amd64` / 544 MB |

导入运行：

```bash
docker load -i pingxixi-0.4.0.tar
docker run -p 8080:8080 pingxixi:0.4.0
# 访问 http://localhost:8080（买家端 / 卖家后台 / API 同端口）
```

> 注意：本镜像由 `topic/fe-dingyuecheng` 工作区构建，含尚未合入 develop 的挑战 C 提交 `da58f87`（C.1 支付 / C.2 配送 / C.3 售后）；而本标签 `v0.4.0`（`c77d1c7`）不含挑战 C。如需与标签严格一致，请 `git checkout v0.4.0` 后重新构建。

---

## 十、已知待完善与后续计划

| 类别 | 内容 | 计划 |
| --- | --- | --- |
| 文档同步 | 需求规格说明书、测试用例尚未补 B.1 / B.2 条目 | 与功能同步更新，避免文档再次落后于实现 |
| 自动化 | `verify-api.ps1` 仍为 27 项（多商品 + 交易历史 + 分类口径） | 补订单状态机与购物车链路断言 |
| 录屏 | 本版本未录制演示视频 | 下一迭代补 |
| 物流信息 | 「开始发货」只有状态，无运单号、承运商与轨迹 | 已在后续挑战 C.2 补齐 |
| 地址簿 | 下单手填收货信息，未沉淀为常用地址 | 已在后续挑战 C.2 补齐 |
| 支付 | 仍为线下交易，订单无支付状态与流水 | 已在后续挑战 C.1 补齐 |
| 库存并发 | 依赖 `@Version` 乐观锁，未做并发压测 | 补并发下单压测与失败重试提示 |
| 统计看板 | 订单量、取消率、热销商品未做可视化 | 后端可基于现有表聚合，前端排入后续迭代 |

---

## 十一、分工

| 成员 | 承担工作 | 主要产物 |
| --- | --- | --- |
| 方浩昱（后端②） | 订单状态机与取消规则、下单事务与库存回滚、购物车 / 收藏服务、接口实测 | `OrderStatus`、`OrderService`、`CartService`、`FavoriteService`、订单三控制器 |
| 王则凯（后端①） | 订单 / 明细 / 购物车 / 收藏数据模型与 Repository、订单号规则、卖家订单分页查询 | `Order`、`OrderItem`、`CartItem`、`Favorite`、4 个 Repository、`SellerOrderController` |
| 丁月诚（前端） | 购物车页、收藏页、客户订单页重构、卖家订单管理页、首页 / 详情入口与路由菜单 | `Cart.vue`、`Favorites.vue`、`CustomerOrders.vue`、`OrderManage.vue`、`Home.vue`、`ProductDetail.vue`、`router/index.js` |
| 戴英杰（测试） | B.1 状态边界、B.2 预选链路与库存一致性实测、四页界面走查 | 评审报告第四章、第五章 |
| 何易（文档 / 组长） | 需求对齐、评审报告与讲述版 PPT、Wiki 与 README 同步 | 评审报告、`docs/media/第四周_第四次评审_讲述版.pptx`、Wiki 首页 |

---

## 十二、相关文档

- 第 4 次成果验收：https://github.com/kaskk345/pingxixi-online-shoppingplatform/wiki/第4次成果验收
- 第 4 次阶段性评审报告：https://github.com/kaskk345/pingxixi-online-shoppingplatform/wiki/第4次阶段性评审报告
- 需求 B 升级 · 更新内容整理：https://github.com/kaskk345/pingxixi-online-shoppingplatform/wiki/需求B_更新内容整理
- 需求规格说明书：https://github.com/kaskk345/pingxixi-online-shoppingplatform/blob/master/docs/wiki/需求规格说明书.md
- 构建部署与接入说明：https://github.com/kaskk345/pingxixi-online-shoppingplatform/blob/master/docs/wiki/构建部署与接入说明.md
- 测试用例与运行说明：https://github.com/kaskk345/pingxixi-online-shoppingplatform/blob/master/docs/wiki/测试用例与运行说明.md
- 讲述版 PPT（12 页）：https://github.com/kaskk345/pingxixi-online-shoppingplatform/blob/master/docs/media/第四周_第四次评审_讲述版.pptx
