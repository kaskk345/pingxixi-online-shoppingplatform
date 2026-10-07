package com.mall.controller;

import com.mall.common.Result;
import com.mall.dto.IntentView;
import com.mall.entity.PurchaseIntent;
import com.mall.service.IntentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class IntentController {

    private final IntentService intentService;

    // ===== 买家端：凭口令码管理自己的意向 =====

    /** 提交购买意向，返回时带上口令码 */
    @PostMapping("/intents")
    public Result<PurchaseIntent> submit(@Valid @RequestBody IntentReq req) {
        return Result.ok(intentService.submit(req.productId(), req.buyerName(), req.buyerPhone(), req.buyerNote()));
    }

    /** 凭口令码查询：排队位次 / 是否进交易 */
    @GetMapping("/intents/track")
    public Result<IntentView> track(@RequestParam String code) {
        return Result.ok(intentService.track(code));
    }

    /** 凭口令码修改姓名与电话 */
    @PutMapping("/intents/track")
    public Result<IntentView> update(@Valid @RequestBody TrackUpdateReq req) {
        return Result.ok(intentService.updateByCode(req.code(), req.buyerName(), req.buyerPhone()));
    }

    /** 凭口令码撤销意向 */
    @PostMapping("/intents/cancel")
    public Result<Void> cancel(@Valid @RequestBody CodeReq req) {
        intentService.cancelByCode(req.code());
        return Result.ok();
    }

    // ===== 卖家端：只查看与标记结果，看不到口令码 =====

    @GetMapping("/seller/intents")
    public Result<List<IntentView>> list(@RequestParam(required = false) Long productId) {
        return Result.ok(productId == null ? intentService.listAll() : intentService.listByProduct(productId));
    }

    /** 开始交易：只允许队首进入，商品自动冻结 */
    @PostMapping("/seller/intents/{id}/start")
    public Result<PurchaseIntent> start(@PathVariable Long id) {
        return Result.ok(intentService.startTrade(id));
    }

    /** 标记交易成功：商品直接已下架 */
    @PostMapping("/seller/intents/{id}/succeed")
    public Result<PurchaseIntent> succeed(@PathVariable Long id) {
        return Result.ok(intentService.succeed(id));
    }

    /** 标记交易失败：商品已恢复在售 */
    @PostMapping("/seller/intents/{id}/fail")
    public Result<PurchaseIntent> fail(@PathVariable Long id) {
        return Result.ok(intentService.fail(id));
    }

    /** 卖家确认：失败的意向作废 */
    @PostMapping("/seller/intents/{id}/void")
    public Result<PurchaseIntent> voidIntent(@PathVariable Long id) {
        return Result.ok(intentService.voidIntent(id));
    }

    /** 卖家确认：失败的意向重新排队（排队时间刷新，位次到队尾） */
    @PostMapping("/seller/intents/{id}/requeue")
    public Result<PurchaseIntent> requeue(@PathVariable Long id) {
        return Result.ok(intentService.requeue(id));
    }

    public record IntentReq(
            @NotNull(message = "商品ID不能为空") Long productId,
            @NotBlank(message = "姓名不能为空") String buyerName,
            @NotBlank(message = "联系电话不能为空") String buyerPhone,
            String buyerNote
    ) {
    }

    public record CodeReq(@NotBlank(message = "请输入口令码") String code) {
    }

    public record TrackUpdateReq(
            @NotBlank(message = "请输入口令码") String code,
            @NotBlank(message = "姓名不能为空") String buyerName,
            @NotBlank(message = "联系电话不能为空") String buyerPhone
    ) {
    }
}
