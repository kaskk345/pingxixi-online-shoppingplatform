package com.mall.controller;

import com.mall.common.Result;
import com.mall.dto.CartItemView;
import com.mall.dto.OrderView;
import com.mall.entity.Address;
import com.mall.entity.Customer;
import com.mall.service.AddressService;
import com.mall.service.CartService;
import com.mall.service.CustomerService;
import com.mall.service.OrderService;
import jakarta.validation.Valid;
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
    private final AddressService addressService;

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
        String name;
        String phone;
        String address;
        if (req.addressId() != null) {
            // 挑战 C.2：优先使用地址簿中选中的地址，并以其收件人信息为准
            Address addr = addressService.getOwned(customerId, req.addressId());
            name = addr.getReceiverName();
            phone = addr.getReceiverPhone();
            address = addr.fullAddress();
        } else {
            name = req.buyerName() == null || req.buyerName().isBlank()
                    ? customer.getUsername() : req.buyerName().trim();
            phone = req.buyerPhone() == null || req.buyerPhone().isBlank()
                    ? customer.getPhone() : req.buyerPhone().trim();
            address = req.address() == null || req.address().isBlank()
                    ? customer.getDefaultAddress() : req.address().trim();
        }
        return Result.ok(orderService.checkoutFromCart(customerId, req.itemIds(), name, phone, address,
                req.remark(), req.addressId()));
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
            String buyerName,
            String buyerPhone,
            String address,
            String remark,
            /** 收货地址簿 ID：传入时以地址簿为准，忽略上面的手输字段 */
            Long addressId
    ) {
    }
}
