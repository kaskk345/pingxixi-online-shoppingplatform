package com.mall.controller;

import com.mall.common.Result;
import com.mall.entity.Product;
import com.mall.entity.PurchaseIntent;
import com.mall.entity.enums.IntentStatus;
import com.mall.entity.enums.ProductStatus;
import com.mall.repository.ProductRepository;
import com.mall.repository.PurchaseIntentRepository;
import com.mall.service.SellerService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;
    private final ProductRepository productRepository;
    private final PurchaseIntentRepository intentRepository;

    @PostMapping("/login")
    public Result<Map<String, String>> login(@Valid @RequestBody LoginReq req) {
        String token = sellerService.login(req.username(), req.password());
        return Result.ok(Map.of("token", token));
    }

    @PutMapping("/password")
    public Result<Void> changePassword(@RequestAttribute("sellerId") Long sellerId,
                                       @Valid @RequestBody PasswordReq req) {
        sellerService.changePassword(sellerId, req.oldPassword(), req.newPassword());
        return Result.ok();
    }

    @GetMapping("/stats")
    public Result<Map<String, Long>> stats() {
        List<Product> products = productRepository.findAll();
        List<PurchaseIntent> intents = intentRepository.findAll();
        Map<String, Long> stats = new HashMap<>();
        stats.put("onSale", products.stream().filter(p -> p.getStatus() == ProductStatus.ON_SALE).count());
        stats.put("frozen", products.stream().filter(p -> p.getStatus() == ProductStatus.FROZEN).count());
        stats.put("sold", products.stream().filter(p -> p.getStatus() == ProductStatus.SOLD).count());
        stats.put("intentTotal", (long) intents.size());
        stats.put("intentSucceeded", intents.stream().filter(i -> i.getStatus() == IntentStatus.SUCCEEDED).count());
        return Result.ok(stats);
    }

    public record LoginReq(
            @NotBlank(message = "用户名不能为空") String username,
            @NotBlank(message = "密码不能为空") String password
    ) {
    }

    public record PasswordReq(
            @NotBlank(message = "原密码不能为空") String oldPassword,
            @NotBlank(message = "新密码不能为空")
            @Size(min = 6, max = 20, message = "新密码长度需在 6-20 位之间") String newPassword
    ) {
    }
}
