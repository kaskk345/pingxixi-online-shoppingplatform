package com.mall.controller;

import com.mall.common.Result;
import com.mall.dto.FavoriteView;
import com.mall.service.FavoriteService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 商品收藏（需客户登录）。
 */
@RestController
@RequestMapping("/api/customer/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public Result<List<FavoriteView>> list(@RequestAttribute("customerId") Long customerId) {
        return Result.ok(favoriteService.list(customerId));
    }

    @GetMapping("/count")
    public Result<Long> count(@RequestAttribute("customerId") Long customerId) {
        return Result.ok(favoriteService.count(customerId));
    }

    /** 商品是否已收藏 */
    @GetMapping("/check")
    public Result<Boolean> check(@RequestAttribute("customerId") Long customerId,
                                 @RequestParam Long productId) {
        return Result.ok(favoriteService.check(customerId, productId));
    }

    @PostMapping
    public Result<FavoriteView> add(@RequestAttribute("customerId") Long customerId,
                                    @Valid @RequestBody FavoriteReq req) {
        return Result.ok(favoriteService.add(customerId, req.productId()));
    }

    @DeleteMapping("/{productId}")
    public Result<Void> remove(@RequestAttribute("customerId") Long customerId,
                               @PathVariable Long productId) {
        favoriteService.remove(customerId, productId);
        return Result.ok();
    }

    public record FavoriteReq(@NotNull(message = "商品ID不能为空") Long productId) {
    }
}
