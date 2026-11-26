package com.mall.controller;

import com.mall.common.Result;
import com.mall.dto.AfterSaleView;
import com.mall.entity.enums.AfterSaleType;
import com.mall.entity.enums.ExpressCompany;
import com.mall.service.AfterSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 客户售后（挑战 C.3）：按订单项申请、查看、留言、撤销、填写退货物流。
 */
@RestController
@RequestMapping("/api/customer/after-sales")
@RequiredArgsConstructor
public class CustomerAfterSaleController {

    private final AfterSaleService afterSaleService;

    @PostMapping
    public Result<AfterSaleView> submit(@RequestAttribute("customerId") Long customerId,
                                        @RequestBody SubmitReq req) {
        return Result.ok(afterSaleService.submit(customerId, req.orderItemId(), req.type(),
                req.title(), req.description(), req.images()));
    }

    @GetMapping
    public Result<List<AfterSaleView>> list(@RequestAttribute("customerId") Long customerId) {
        return Result.ok(afterSaleService.listByCustomer(customerId));
    }

    /** 某订单下所有售后单，供订单页显示角标 */
    @GetMapping("/order/{orderId}")
    public Result<List<AfterSaleView>> listByOrder(@RequestAttribute("customerId") Long customerId,
                                                   @PathVariable Long orderId) {
        return Result.ok(afterSaleService.listByCustomerOrder(customerId, orderId));
    }

    @GetMapping("/{id}")
    public Result<AfterSaleView> detail(@RequestAttribute("customerId") Long customerId,
                                        @PathVariable Long id) {
        return Result.ok(afterSaleService.getForCustomer(customerId, id));
    }

    @PostMapping("/{id}/cancel")
    public Result<AfterSaleView> cancel(@RequestAttribute("customerId") Long customerId,
                                        @PathVariable Long id) {
        return Result.ok(afterSaleService.cancelByCustomer(customerId, id));
    }

    @PostMapping("/{id}/message")
    public Result<AfterSaleView> message(@RequestAttribute("customerId") Long customerId,
                                         @PathVariable Long id,
                                         @RequestBody MessageReq req) {
        return Result.ok(afterSaleService.messageByCustomer(customerId, id, req.content()));
    }

    @PostMapping("/{id}/ship-back")
    public Result<AfterSaleView> shipBack(@RequestAttribute("customerId") Long customerId,
                                          @PathVariable Long id,
                                          @RequestBody ShipBackReq req) {
        return Result.ok(afterSaleService.shipBack(customerId, id,
                req.expressCompany(), req.trackingNo()));
    }

    public record SubmitReq(
            Long orderItemId,
            AfterSaleType type,
            String title,
            String description,
            List<String> images
    ) {
    }

    public record MessageReq(String content) {
    }

    public record ShipBackReq(ExpressCompany expressCompany, String trackingNo) {
    }
}
