# 分工说明 · 后端收藏与购物车（王则凯）

- 分支：`topic/be-wangzekai`
- 角色：后端
- 负责模块：B.2 收藏、购物车、多件下单、批量转收藏
- 负责目录：`backend/src/main/java/com/mall/`

## 负责文件（11 个）

- `backend/src/main/java/com/mall/entity/Favorite.java`
- `backend/src/main/java/com/mall/entity/CartItem.java`
- `backend/src/main/java/com/mall/dto/FavoriteView.java`
- `backend/src/main/java/com/mall/dto/CartItemView.java`
- `backend/src/main/java/com/mall/repository/FavoriteRepository.java`
- `backend/src/main/java/com/mall/repository/CartItemRepository.java`
- `backend/src/main/java/com/mall/service/FavoriteService.java`
- `backend/src/main/java/com/mall/service/CartService.java`
- `backend/src/main/java/com/mall/controller/FavoriteController.java`
- `backend/src/main/java/com/mall/controller/CartController.java`
- `backend/src/main/java/com/mall/controller/CustomerController.java`（−10 行，客户接口调整）

## 对应需求

- B.2-1 商品收藏
- B.2-2 购物车
- B.2-3 购物车多件下单（`OrderService.checkoutFromCart`）
- B.2-4 购物车批量转收藏（`/cart/to-favorites`）

## 工作边界

- 只修改上述收藏/购物车相关文件
- 订单模块由方浩昱负责，前端由丁月诚负责
- 测试用例由戴英杰负责，合并发布由何易负责

## 说明

上述文件已随提交 `4d6085b` 合入 `main`，本分支用于后续收藏/购物车改动与提交记录留痕。
