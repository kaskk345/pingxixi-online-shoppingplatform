package com.mall.controller;

import com.mall.common.Result;
import com.mall.dto.OrderView;
import com.mall.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 客户订单：查看、取消（开始发货前）。
 */
@RestController
@RequestMapping("/api/customer/orders")
@RequiredArgsConstructor
public class CustomerOrderController {

    private final OrderService orderService;

    @GetMapping
    public Result<List<OrderView>> list(@RequestAttribute("customerId") Long customerId) {
        return Result.ok(orderService.listByCustomer(customerId));
    }

    @GetMapping("/{id}")
    public Result<OrderView> detail(@RequestAttribute("customerId") Long customerId, @PathVariable Long id) {
        return Result.ok(orderService.getForCustomer(customerId, id));
    }

    /** 取消订单：订单处于开始发货之前 */
    @PostMapping("/{id}/cancel")
    public Result<OrderView> cancel(@RequestAttribute("customerId") Long customerId,
                                    @PathVariable Long id,
                                    @RequestBody(required = false) CancelReq req) {
        return Result.ok(orderService.cancelByCustomer(customerId, id, req == null ? null : req.reason()));
    }

    public record CancelReq(String reason) {
    }
}
