package com.mall.controller;

import com.mall.common.Result;
import com.mall.dto.AfterSaleView;
import com.mall.entity.enums.AfterSaleResult;
import com.mall.entity.enums.AfterSaleStatus;
import com.mall.service.AfterSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * 商家售后管理（挑战 C.3）：查看申请、协商回复、给出处理结果、确认收到退货。
 */
@RestController
@RequestMapping("/api/seller/after-sales")
@RequiredArgsConstructor
public class SellerAfterSaleController {

    private final AfterSaleService afterSaleService;

    @GetMapping
    public Result<Page<AfterSaleView>> list(@RequestParam(required = false) AfterSaleStatus status,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return Result.ok(afterSaleService.listForSeller(status, page, size));
    }

    @GetMapping("/{id}")
    public Result<AfterSaleView> detail(@PathVariable Long id) {
        return Result.ok(afterSaleService.getForSeller(id));
    }

    /** 协商回复：待处理 -> 协商中 */
    @PostMapping("/{id}/reply")
    public Result<AfterSaleView> reply(@PathVariable Long id, @RequestBody ReplyReq req) {
        return Result.ok(afterSaleService.replyBySeller(id, req.content()));
    }

    /** 给出处理结果：退货退款 / 仅退款 / 换货 / 维修 / 拒绝 */
    @PostMapping("/{id}/resolve")
    public Result<AfterSaleView> resolve(@PathVariable Long id, @RequestBody ResolveReq req) {
        return Result.ok(afterSaleService.resolveBySeller(id, req.result(), req.refundAmount(), req.reply()));
    }

    /** 确认收到退货：执行退款并完成售后 */
    @PostMapping("/{id}/receive")
    public Result<AfterSaleView> receive(@PathVariable Long id) {
        return Result.ok(afterSaleService.receiveBySeller(id));
    }

    public record ReplyReq(String content) {
    }

    public record ResolveReq(AfterSaleResult result, BigDecimal refundAmount, String reply) {
    }
}
