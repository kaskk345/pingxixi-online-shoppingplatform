package com.mall.controller;

import com.mall.common.Result;
import com.mall.dto.CartItemView;
import com.mall.dto.OrderView;
import com.mall.entity.Customer;
import com.mall.service.CartService;
import com.mall.service.CustomerService;
import com.mall.service.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 购物车与多件商品下单（需客户登录）。
 */
@RestController
@RequestMapping("/api/customer/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final OrderService orderService;
    private final CustomerService customerService;

    @GetMapping
    public Result<List<CartItemView>> list(@RequestAttribute("customerId") Long customerId) {
        return Result.ok(cartService.list(customerId));
    }

    @GetMapping("/count")
    public Result<Long> count(@RequestAttribute("customerId") Long customerId) {
        return Result.ok(cartService.count(customerId));
    }

    @PostMapping
    public Result<CartItemView> add(@RequestAttribute("customerId") Long customerId,
                                    @Valid @RequestBody AddReq req) {
        return Result.ok(cartService.add(customerId, req.productId(), req.quantity()));
    }

    @PutMapping("/{id}")
    public Result<CartItemView> update(@RequestAttribute("customerId") Long customerId,
                                       @PathVariable Long id,
                                       @Valid @RequestBody QuantityReq req) {
        return Result.ok(cartService.updateQuantity(customerId, id, req.quantity()));
    }

    @DeleteMapping("/{id}")
    public Result<Void> remove(@RequestAttribute("customerId") Long customerId, @PathVariable Long id) {
        cartService.remove(customerId, id);
        return Result.ok();
    }

    @DeleteMapping
    public Result<Void> clear(@RequestAttribute("customerId") Long customerId) {
        cartService.clear(customerId);
        return Result.ok();
    }

    /** 勾选多件商品转为收藏 */
    @PostMapping("/to-favorites")
    public Result<Integer> toFavorites(@RequestAttribute("customerId") Long customerId,
                                       @Valid @RequestBody IdsReq req) {
        return Result.ok(cartService.moveToFavorites(customerId, req.itemIds()));
    }

    /** 勾选多件商品下单：合并生成一个订单 */
    @PostMapping("/checkout")
    public Result<OrderView> checkout(@RequestAttribute("customerId") Long customerId,
                                      @Valid @RequestBody CheckoutReq req) {
        Customer customer = customerService.get(customerId);
        String name = req.buyerName() == null || req.buyerName().isBlank()
                ? customer.getUsername() : req.buyerName().trim();
        String phone = req.buyerPhone() == null || req.buyerPhone().isBlank()
                ? customer.getPhone() : req.buyerPhone().trim();
        String address = req.address() == null || req.address().isBlank()
                ? customer.getDefaultAddress() : req.address().trim();
        return Result.ok(orderService.checkoutFromCart(customerId, req.itemIds(), name, phone, address, req.remark()));
    }

    public record AddReq(
            @NotNull(message = "商品ID不能为空") Long productId,
            Integer quantity
    ) {
    }

    public record QuantityReq(
            @NotNull(message = "数量不能为空") Integer quantity
    ) {
    }

    public record IdsReq(
            @NotEmpty(message = "请选择商品") List<Long> itemIds
    ) {
    }

    public record CheckoutReq(
            @NotEmpty(message = "请选择要下单的商品") List<Long> itemIds,
            @NotBlank(message = "收货人不能为空") String buyerName,
            @NotBlank(message = "联系电话不能为空") String buyerPhone,
            String address,
            String remark
    ) {
    }
}
