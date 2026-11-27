# 需求 B 升级 · 更新内容整理（B.1 订单 / B.2 商品预选）

> - 项目：在线购物系统（拼夕夕 PinXixi）· 第 4 组
> - 范围：课程挑战 **B 组**两项升级 —— **B.1 订单升级**、**B.2 商品预选升级**
> - 代码依据：提交 `4d6085b`（2026-11-09），在上一版交付基线 v0.3.0（`3d8bf45`）之上 rebase 合入，未改写远端历史
> - 变更规模：**33 个文件，+2196 / −28**；新增 **23 个接口**、**4 张表**、**1 个订单状态枚举**、**3 个新页面**
> - 整理日期：2026-11-16（2026-11-18 发布到 Wiki）

**配套材料**

- 评审正文：[第 4 次阶段性评审报告](第4次阶段性评审报告)（评审范围、实测证据与结论）
- 讲述版 PPT（12 页）：[.pptx](https://github.com/kaskk345/pingxixi-online-shoppingplatform/blob/master/docs/media/第四周_第四次评审_讲述版.pptx) · [.pdf](https://github.com/kaskk345/pingxixi-online-shoppingplatform/blob/master/docs/media/第四周_第四次评审_讲述版.pdf) · [逐页预览](第4次阶段性评审报告#附汇报-ppt-与逐页预览)
- 相关页面：[需求规格说明书](需求规格说明书) · [测试用例与运行说明](测试用例与运行说明) · [返回首页](Home)

---

## 一、需求清单与完成情况

挑战 B 共 **7 条**需求，本轮全部落地，均有接口与页面支撑。

| 编号 | 需求 | 实现要点 | 状态 |
| --- | --- | --- | --- |
| B.1-1 | 订单包含客户下单、商家确认、备货完成、开始发货、交易完成 5 个状态 | `OrderStatus` 五状态 + `CANCELED` 终态；卖家按序推进，跨状态操作被拒绝 | 已完成 |
| B.1-2 | 开始发货状态前，客户可以取消订单 | `POST /api/customer/orders/{id}/cancel`；仅 `PLACED / CONFIRMED / PREPARED` 可取消 | 已完成 |
| B.1-3 | 交易完成状态前，商家可以取消订单 | `POST /api/seller/orders/{id}/cancel`；除 `COMPLETED / CANCELED` 外均可取消 | 已完成 |
| B.2-1 | 客户可以收藏商品 | 收藏 / 取消收藏 / 是否已收藏 / 收藏列表，`(customerId, productId)` 唯一 | 已完成 |
| B.2-2 | 客户可以选择商品进入购物车 | 加入、改数量、删除、清空；重复加入累加数量，数量受库存约束 | 已完成 |
| B.2-3 | 从购物车中选择多件商品进行下单 | `POST /api/customer/cart/checkout`：多件合并为一个订单，逐条价格快照 | 已完成 |
| B.2-4 | 从购物车中选择多件商品转为收藏 | `POST /api/customer/cart/to-favorites`：批量写收藏并移除购物车条目 | 已完成 |

> 原有「购买意向排队 + 口令码」能力**保留**，用于线下交易场景；本轮订单链路独立建表，两者互不影响。

---

## 二、B.1 订单升级

### 2.1 五状态状态机

| 状态 | 枚举 | 含义 | 可执行的下一步 |
| --- | --- | --- | --- |
| 客户下单 | `PLACED` | 订单已生成，库存已扣减 | 商家确认 / 客户取消 / 商家取消 |
| 商家确认 | `CONFIRMED` | 商家接单 | 备货完成 / 客户取消 / 商家取消 |
| 备货完成 | `PREPARED` | 商品已备好 | 开始发货 / 客户取消 / 商家取消 |
| 开始发货 | `SHIPPED` | 已发出，客户不可再取消 | 交易完成 / 商家取消 |
| 交易完成 | `COMPLETED` | 终态，累计销量 | 无 |
| 已取消 | `CANCELED` | 终态，记录取消方与原因 | 无 |

实现位于 `entity/enums/OrderStatus.java`，用枚举方法表达规则，避免控制器里散落 `if-else`：

```java
public boolean cancellableByCustomer() {   // 开始发货之前
    return this == PLACED || this == CONFIRMED || this == PREPARED;
}

public boolean cancellableBySeller() {     // 交易完成之前
    return this != COMPLETED && this != CANCELED;
}
```

### 2.2 两条取消规则

| 角色 | 可取消窗口 | 接口 | 取消后处理 |
| --- | --- | --- | --- |
| 客户 | 客户下单 / 商家确认 / 备货完成 | `POST /api/customer/orders/{id}/cancel` | 订单置 `CANCELED`，`canceledBy=CUSTOMER`，库存逐项回滚 |
| 商家 | 交易完成之前的四个状态 | `POST /api/seller/orders/{id}/cancel` | 订单置 `CANCELED`，`canceledBy=SELLER`，记录原因，库存回滚 |

取消统一走 `OrderService.doCancel`：写入 `canceledAt / canceledBy / cancelReason`，再按订单明细把 `quantity` 加回对应商品库存；若商品此前因库存归零自动下架，库存恢复为正数时重新上架；销量只在交易完成时累加，取消不扣减销量。

### 2.3 数据模型（新增 4 张表）

| 实体 | 表名 | 关键字段 |
| --- | --- | --- |
| `Order` | `mall_order` | `orderNo`（唯一）、`customerId`、`buyerName`、`buyerPhone`、`address`、`remark`、`totalAmount`、`itemCount`、`status`、`canceledBy`、`cancelReason`、各节点时间 |
| `OrderItem` | `order_item` | `orderId`、`productId`、`productName`、`productImage`、`price`、`quantity`、`subtotal` |
| `CartItem` | `cart_item` | `customerId + productId` 唯一、`quantity` |
| `Favorite` | `favorite` | `customerId + productId` 唯一 |

- `OrderItem` 保存**名称 / 图片 / 单价快照**，卖家后续改价、改名不影响历史订单金额。
- `Order` 记录 `createdAt / confirmedAt / preparedAt / shippedAt / completedAt / canceledAt`，状态变化全程可追溯。
- 订单号规则：`SO + yyyyMMddHHmmss + 4 位随机数`，数据库唯一约束兜底，冲突自动重试。

### 2.4 新增接口（10 个）

| 端 | 方法 | 路径 | 说明 |
| --- | --- | --- | --- |
| 客户 | GET | `/api/customer/orders` | 订单列表（含明细、节点时间、可取消标记） |
| 客户 | GET | `/api/customer/orders/{id}` | 订单详情（仅本人） |
| 客户 | POST | `/api/customer/orders/{id}/cancel` | 取消订单（开始发货前） |
| 卖家 | GET | `/api/seller/orders` | 订单列表（`status` 筛选 + 分页） |
| 卖家 | GET | `/api/seller/orders/{id}` | 订单详情 |
| 卖家 | POST | `/api/seller/orders/{id}/confirm` | `PLACED → CONFIRMED` |
| 卖家 | POST | `/api/seller/orders/{id}/prepare` | `CONFIRMED → PREPARED` |
| 卖家 | POST | `/api/seller/orders/{id}/ship` | `PREPARED → SHIPPED` |
| 卖家 | POST | `/api/seller/orders/{id}/complete` | `SHIPPED → COMPLETED` |
| 卖家 | POST | `/api/seller/orders/{id}/cancel` | 取消订单（交易完成前） |

鉴权沿用现有拦截器：`/api/customer/**` 校验客户 token，`/api/seller/**` 校验卖家 token。

### 2.5 下单事务：一次请求完成 5 件事

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
- 商品实体保留 `@Version` 乐观锁，库存随实体更新，并发修改时由 JPA 校验版本。
- 下单即扣库存（而非发货时扣），保证「订单成立 = 库存已锁定」，与既有意向预占的库存口径一致。

### 2.6 前端页面

**卖家端订单管理页 `/seller/orders`**

- 状态筛选覆盖五个状态与已取消，列表按创建时间倒序分页。
- 操作列按当前状态只显示唯一「下一步」按钮：确认订单 / 备货完成 / 开始发货 / 交易完成，避免跳步。
- 「取消订单」在交易完成前显示，弹窗填写取消原因，成功后库存自动回滚。
- 「详情」弹窗展示五节点进度、收货信息、商品明细与合计。

**客户订单页 `/customer/orders`**

- 状态页签：全部 / 客户下单 / 商家确认 / 备货完成 / 开始发货 / 交易完成 / 已取消。
- 展开行显示五节点时间轴、商品明细、收货信息。
- 「取消订单」按钮仅在前三个状态出现；取消需二次确认并可填写原因，成功后页面与库存同步刷新。
- 已取消订单保留完整明细，显示取消方与原因。

### 2.7 实测记录

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

另一笔订单在 `PLACED` 状态由客户取消：订单变为 `CANCELED`，商品库存由 `0` 恢复为 `1`，状态恢复在售；再一笔订单在 `CONFIRMED` 状态由商家取消，`canceledBy=SELLER`，取消原因与库存回滚均符合预期。

---

## 三、B.2 商品预选升级

### 3.1 收藏（`/favorites`）

- 收藏关系只存 `(customerId, productId)`，重复收藏不新增记录；实测重复收藏后收藏总数保持不变。
- 收藏列表展示时联表读取商品**当前**价格、库存与状态，避免商品改价后收藏页显示过期价格。
- 商品不可购买时「加入购物车」置灰，但仍可取消收藏。
- 商品详情页提供「收藏 / 已收藏」切换；首页商品卡提供快捷收藏入口。

### 3.2 购物车（`/cart`）

- 同一客户同一商品只保留一条记录，重复加入累加数量。
- 数量步进器即时校验库存：超过库存返回「库存不足，仅剩 N 件」，超过单件上限返回「单件商品最多购买 99 件」。
- 支持修改数量、删除单条、清空购物车；不可购买商品的条目标记为「不可购买」，不可勾选结算。

### 3.3 多件商品合并下单

- 勾选购物车中多件商品 → 结算弹窗（默认带出客户资料，可改收货人、电话、交易地点、备注）→ 生成**一个订单 + N 条订单明细**。
- 下单成功后对应购物车条目自动删除，并跳转「我的订单」；返回订单号便于核对。
- 总金额为各明细小计之和，价格为下单时快照；下单同时扣减各商品库存，库存归零自动下架。

### 3.4 购物车批量转收藏

```http
POST /api/customer/cart/to-favorites
Body: { "itemIds": [12, 13, 14] }
Response: 3   // 实际转移条数
```

- 勾选多条后一键转收藏：已在收藏中的商品跳过创建，但同样从购物车移除。
- 与多件下单共用同一套勾选结果：现在买 → 合并下单；以后再买 → 批量转收藏。
- 购物车条目在任一通道完成后都会被移除，避免重复下单。

### 3.5 新增接口（13 个）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/customer/cart` | 购物车列表 |
| GET | `/api/customer/cart/count` | 购物车条目数 |
| POST | `/api/customer/cart` | 加入购物车（同一商品累加） |
| PUT | `/api/customer/cart/{id}` | 修改数量 |
| DELETE | `/api/customer/cart/{id}` | 删除条目 |
| DELETE | `/api/customer/cart` | 清空购物车 |
| POST | `/api/customer/cart/checkout` | 勾选多件商品下单 |
| POST | `/api/customer/cart/to-favorites` | 勾选多件商品转为收藏 |
| GET | `/api/customer/favorites` | 收藏列表 |
| GET | `/api/customer/favorites/count` | 收藏数量 |
| GET | `/api/customer/favorites/check?productId=` | 是否已收藏 |
| POST | `/api/customer/favorites` | 收藏商品 |
| DELETE | `/api/customer/favorites/{productId}` | 取消收藏 |

---

## 四、边界与一致性验证

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

**构建与走查**：后端 `mvn -q -DskipTests package` 通过；前端 `npm run build` 通过；购物车页、收藏页、客户订单页、卖家订单页渲染正常，浏览器控制台无 error 级日志。

---

## 五、代码落点（新增 / 修改文件）

**后端（21 个文件）**

| 层 | 文件 |
| --- | --- |
| 控制器 | `CartController`、`FavoriteController`、`CustomerOrderController`、`SellerOrderController`（`CustomerController` −10 行） |
| 服务 | `OrderService`（+328）、`CartService`（+158）、`FavoriteService`（+79） |
| 实体 / 枚举 | `Order`、`OrderItem`、`CartItem`、`Favorite`、`entity/enums/OrderStatus` |
| DTO | `OrderView`、`OrderItemView`、`CartItemView`、`FavoriteView` |
| 仓储 | `OrderRepository`、`OrderItemRepository`、`CartItemRepository`、`FavoriteRepository` |

**前端（10 个文件）**

| 类型 | 文件 |
| --- | --- |
| 新增页面 | `views/Cart.vue`、`views/Favorites.vue`、`views/seller/OrderManage.vue` |
| 改造页面 | `views/CustomerOrders.vue`、`views/Home.vue`、`views/ProductDetail.vue`、`views/SellerLayout.vue` |
| 路由 / 工具 | `router/index.js`、`utils/status.js`、`main.js` |

> **更新文件已随附**：以上 33 个文件已按仓库原目录结构导出为独立文件包（含 `文件清单.md`），见桌面 `pingxixi_需求B更新文件\` 与 `pingxixi_需求B更新文件.zip`。该包仅包含本次提交涉及的文件，非完整可运行工程。

---

## 六、分工

| 成员 | 承担工作 | 主要成果物 |
| --- | --- | --- |
| 方浩昱（后端②） | 订单状态机与取消规则、下单事务与库存回滚、购物车 / 收藏服务、接口实测 | `OrderStatus`、`OrderService`、`CartService`、`FavoriteService`、订单三控制器 |
| 王则凯（后端①） | 订单 / 明细 / 购物车 / 收藏数据模型与 Repository、订单号规则、卖家订单分页查询 | 4 个实体、4 个 Repository、`SellerOrderController` |
| 丁月诚（前端） | 购物车、收藏、客户订单页重构、卖家订单管理页、入口与路由菜单 | `Cart.vue`、`Favorites.vue`、`CustomerOrders.vue`、`OrderManage.vue` 等 |
| 戴英杰（测试） | B.1 状态边界、B.2 预选链路与库存一致性实测、四页界面走查 | 验证记录（本文第四节） |
| 何易（文档 / 组长） | 需求对齐、评审报告与讲述版 PPT、Wiki 与 README 同步 | 第 4 次评审报告、`第四周_第四次评审_讲述版.pptx` |

---

## 七、遗留问题与后续计划

| 类别 | 内容 | 计划 |
| --- | --- | --- |
| 物流信息 | 「开始发货」只有状态，无物流单号、承运商与轨迹 | 下一迭代补 `shipmentNo / carrier` 字段与录入入口 |
| 地址簿 | 下单手填收货信息，未沉淀为常用地址 | 新增客户地址表与默认地址选择 |
| 支付 | 仍为线下交易，订单无支付状态与流水 | 与「线下交易」基线一致，暂不引入在线支付 |
| 库存并发 | 依赖 `@Version` 乐观锁，未做并发压测 | 补并发下单压测与失败重试提示 |
| 统计看板 | 订单量、取消率、热销商品未可视化 | 基于现有表聚合，前端排入后续迭代 |
| 商品图片 | 种子商品图 `product_10.png` 在全新克隆环境 404 | 示例图纳入仓库或改用占位图 |
| 文档同步 | 需求规格说明书、测试用例尚未补 B.1 / B.2 条目 | 下一迭代与功能同步更新 |

---

## 八、结论

1. 挑战 B 首批 **7 条需求全部落地**：订单五状态、客户取消、商家取消、收藏、购物车、多件合并下单、批量转收藏，均有接口与页面支撑。
2. **规则边界可验证**：发货后客户取消被拒、交易完成后商家取消被拒、重复取消被拒；取消后库存回滚正确。
3. **下单事务自洽**：多件商品合并为一个订单，明细价格快照、库存扣减、购物车清理在同一事务内完成。
4. **页面闭环完整**：客户侧「浏览 → 收藏 / 加购 → 合并下单 → 查看进度 → 条件取消」；卖家侧「查看 → 确认 → 备货 → 发货 → 完成 / 取消」。
5. **对既有能力无破坏**：基于 v0.3.0 rebase 合入，挑战 A 与意向排队流程未回归失败，前后端构建均通过。

---

## 附：来源

| 内容 | 文件 |
| --- | --- |
| 需求条目与验收标准 | `产品订单_ProductBacklog.md` §9.5 本轮新增需求（B 组升级，v1.1 / 2026-11-09） |
| 功能说明与接口清单 | `README.md`「本轮升级（B.1 订单 / B.2 商品预选）」、核心接口一览 |
| 实现细节与验证记录 | [第 4 次阶段性评审报告](第4次阶段性评审报告) |
| 汇报材料 | [第四周_第四次评审_讲述版.pptx](https://github.com/kaskk345/pingxixi-online-shoppingplatform/blob/master/docs/media/第四周_第四次评审_讲述版.pptx)（12 页，[逐页预览](第4次阶段性评审报告#附汇报-ppt-与逐页预览)） |
| 代码改动 | 提交 `4d6085b`：feat(订单): 新增B.1订单五状态流转与B.2收藏/购物车多件下单 |
| 更新文件 | `pingxixi_需求B更新文件\`（33 个文件，含 `文件清单.md`）；压缩包 `pingxixi_需求B更新文件.zip` |
