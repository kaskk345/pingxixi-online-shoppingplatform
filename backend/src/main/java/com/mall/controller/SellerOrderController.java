package com.mall.controller;

import com.mall.common.Result;
import com.mall.dto.OrderView;
import com.mall.entity.enums.OrderStatus;
import com.mall.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

/**
 * 卖家订单管理：确认 -> 备货完成 -> 开始发货 -> 交易完成；交易完成前可取消。
 */
@RestController
@RequestMapping("/api/seller/orders")
@RequiredArgsConstructor
public class SellerOrderController {

    private final OrderService orderService;

    @GetMapping
    public Result<Page<OrderView>> list(@RequestParam(required = false) OrderStatus status,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return Result.ok(orderService.listAll(status, pageable));
    }

    @GetMapping("/{id}")
    public Result<OrderView> detail(@PathVariable Long id) {
        return Result.ok(orderService.get(id));
    }

    @PostMapping("/{id}/confirm")
    public Result<OrderView> confirm(@PathVariable Long id) {
        return Result.ok(orderService.confirm(id));
    }

    @PostMapping("/{id}/prepare")
    public Result<OrderView> prepare(@PathVariable Long id) {
        return Result.ok(orderService.prepare(id));
    }

    @PostMapping("/{id}/ship")
    public Result<OrderView> ship(@PathVariable Long id) {
        return Result.ok(orderService.ship(id));
    }

    @PostMapping("/{id}/complete")
    public Result<OrderView> complete(@PathVariable Long id) {
        return Result.ok(orderService.complete(id));
    }

    /** 取消订单：交易完成之前 */
    @PostMapping("/{id}/cancel")
    public Result<OrderView> cancel(@PathVariable Long id, @RequestBody(required = false) CancelReq req) {
        return Result.ok(orderService.cancelBySeller(id, req == null ? null : req.reason()));
    }

    public record CancelReq(String reason) {
    }
}
