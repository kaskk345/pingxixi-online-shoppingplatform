package com.mall.controller;

import com.mall.common.Result;
import com.mall.dto.PaymentView;
import com.mall.entity.enums.PaymentChannel;
import com.mall.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 客户线上支付（挑战 C.1）：创建支付单、模拟收银台确认、支付宝异步通知。
 */
@RestController
@RequestMapping("/api/customer/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /** 发起支付：订单进入「待支付」，返回渠道跳转地址 */
    @PostMapping
    public Result<PaymentView> create(@RequestAttribute("customerId") Long customerId,
                                      @RequestBody CreateReq req) {
        return Result.ok(paymentService.create(customerId, req.orderId(), req.channel()));
    }

    @GetMapping("/{paymentNo}")
    public Result<PaymentView> detail(@RequestAttribute("customerId") Long customerId,
                                      @PathVariable String paymentNo) {
        return Result.ok(paymentService.getForCustomer(customerId, paymentNo));
    }

    @GetMapping
    public Result<List<PaymentView>> listByOrder(@RequestAttribute("customerId") Long customerId,
                                                 @RequestParam Long orderId) {
        return Result.ok(paymentService.listByOrder(customerId, orderId));
    }

    /** 模拟渠道：确认支付成功 -> 订单变为「已支付」 */
    @PostMapping("/{paymentNo}/confirm")
    public Result<PaymentView> confirm(@RequestAttribute("customerId") Long customerId,
                                       @PathVariable String paymentNo) {
        return Result.ok(paymentService.confirmMock(customerId, paymentNo));
    }

    /** 模拟渠道：放弃支付 / 支付失败 */
    @PostMapping("/{paymentNo}/fail")
    public Result<PaymentView> fail(@RequestAttribute("customerId") Long customerId,
                                    @PathVariable String paymentNo,
                                    @RequestBody(required = false) FailReq req) {
        return Result.ok(paymentService.failMock(customerId, paymentNo, req == null ? null : req.reason()));
    }

    /**
     * 支付宝异步通知（公网回调入口）。
     * 支付宝要求返回纯文本 success，否则会重复通知。
     */
    @PostMapping(value = "/alipay/notify", produces = MediaType.TEXT_PLAIN_VALUE)
    public String alipayNotify(@RequestParam Map<String, String> params) {
        return paymentService.handleAlipayNotify(params);
    }

    public record CreateReq(Long orderId, PaymentChannel channel) {
    }

    public record FailReq(String reason) {
    }
}
