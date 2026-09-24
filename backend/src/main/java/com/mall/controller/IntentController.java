package com.mall.controller;

import com.mall.common.Result;
import com.mall.entity.PurchaseIntent;
import com.mall.service.IntentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class IntentController {

    private final IntentService intentService;

    // ===== 买家端 =====

    @PostMapping("/intents")
    public Result<PurchaseIntent> submit(@Valid @RequestBody IntentReq req) {
        return Result.ok(intentService.submit(req.productId(), req.buyerName(), req.buyerPhone(), req.buyerNote()));
    }

    @GetMapping("/intents/query")
    public Result<PurchaseIntent> query(@RequestParam String phone, @RequestParam Long id) {
        return Result.ok(intentService.query(phone, id));
    }

    // ===== 卖家端（需登录） =====

    @GetMapping("/seller/intents")
    public Result<List<PurchaseIntent>> list() {
        return Result.ok(intentService.listAll());
    }

    @PostMapping("/seller/intents/{id}/accept")
    public Result<PurchaseIntent> accept(@PathVariable Long id) {
        return Result.ok(intentService.accept(id));
    }

    @PostMapping("/seller/intents/{id}/reject")
    public Result<PurchaseIntent> reject(@PathVariable Long id) {
        return Result.ok(intentService.reject(id));
    }

    @PostMapping("/seller/intents/{id}/succeed")
    public Result<PurchaseIntent> succeed(@PathVariable Long id) {
        return Result.ok(intentService.succeed(id));
    }

    @PostMapping("/seller/intents/{id}/fail")
    public Result<PurchaseIntent> fail(@PathVariable Long id) {
        return Result.ok(intentService.fail(id));
    }

    public record IntentReq(
            @NotNull(message = "商品ID不能为空") Long productId,
            @NotBlank(message = "姓名不能为空") String buyerName,
            @NotBlank(message = "手机号不能为空")
            @Pattern(regexp = "^1\\d{10}$", message = "手机号格式不正确") String buyerPhone,
            String buyerNote
    ) {
    }
}
