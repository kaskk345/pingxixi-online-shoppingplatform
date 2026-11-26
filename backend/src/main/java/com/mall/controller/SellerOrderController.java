package com.mall.controller;

import com.mall.common.Result;
import com.mall.dto.LogisticsView;
import com.mall.dto.OrderView;
import com.mall.dto.PaymentView;
import com.mall.entity.enums.ExpressCompany;
import com.mall.entity.enums.OrderStatus;
import com.mall.service.LogisticsService;
import com.mall.service.OrderService;
import com.mall.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 卖家订单管理：确认 -> 备货完成 -> 开始发货 -> 交易完成；交易完成前可取消。
 */
@RestController
@RequestMapping("/api/seller/orders")
@RequiredArgsConstructor
public class SellerOrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;
    private final LogisticsService logisticsService;

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

    /** 订单的支付记录（挑战 C.1） */
    @GetMapping("/{id}/payments")
    public Result<List<PaymentView>> payments(@PathVariable Long id) {
        return Result.ok(paymentService.listByOrderForSeller(id));
    }

    @PostMapping("/{id}/confirm")
    public Result<OrderView> confirm(@PathVariable Long id) {
        return Result.ok(orderService.confirm(id));
    }

    @PostMapping("/{id}/prepare")
    public Result<OrderView> prepare(@PathVariable Long id) {
        return Result.ok(orderService.prepare(id));
    }

    /** 开始发货：必须选择快递公司，运单号留空则系统生成 */
    @PostMapping("/{id}/ship")
    public Result<OrderView> ship(@PathVariable Long id,
                                  @RequestBody(required = false) ShipReq req) {
        return Result.ok(orderService.ship(id,
                req == null ? null : req.expressCompany(),
                req == null ? null : req.trackingNo()));
    }

    /** 更新物流：已揽收 -> 运输中 -> 派送中 -> 已签收 */
    @PostMapping("/{id}/logistics/advance")
    public Result<OrderView> advanceLogistics(@PathVariable Long id) {
        return Result.ok(orderService.advanceLogistics(id));
    }

    /** 卖家查看运单与轨迹 */
    @GetMapping("/{id}/logistics")
    public Result<LogisticsView> logistics(@PathVariable Long id) {
        return Result.ok(logisticsService.detailForSeller(id));
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

    public record ShipReq(ExpressCompany expressCompany, String trackingNo) {
    }
}
