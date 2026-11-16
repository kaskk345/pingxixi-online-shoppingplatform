# 分工说明 · 后端订单（方浩昱）

- 分支：`topic/be-fanghaoyu`
- 角色：后端
- 负责模块：B.1 订单五状态与取消
- 负责目录：`backend/src/main/java/com/mall/`

## 负责文件（10 个）

- `backend/src/main/java/com/mall/entity/enums/OrderStatus.java`
- `backend/src/main/java/com/mall/entity/Order.java`
- `backend/src/main/java/com/mall/entity/OrderItem.java`
- `backend/src/main/java/com/mall/dto/OrderView.java`
- `backend/src/main/java/com/mall/dto/OrderItemView.java`
- `backend/src/main/java/com/mall/repository/OrderRepository.java`
- `backend/src/main/java/com/mall/repository/OrderItemRepository.java`
- `backend/src/main/java/com/mall/service/OrderService.java`
- `backend/src/main/java/com/mall/controller/SellerOrderController.java`
- `backend/src/main/java/com/mall/controller/CustomerOrderController.java`

## 对应需求

- B.1-1 订单五状态流转
- B.1-2 客户取消订单
- B.1-3 商家取消订单
- B.1 订单与订单项数据模型

## 工作边界

- 只修改上述订单相关文件
- 收藏/购物车模块由王则凯负责，前端由丁月诚负责
- 测试用例由戴英杰负责，合并发布由何易负责

## 说明

上述文件已随提交 `4d6085b` 合入 `main`，本分支用于后续订单模块改动与提交记录留痕。
