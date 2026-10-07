package com.mall.controller;

import com.mall.common.Result;
import com.mall.entity.Product;
import com.mall.service.ProductService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ===== 买家端 =====

    /** 当前唯一可购买的商品（在售 / 已恢复在售；没有则 data 为 null） */
    @GetMapping("/products/on-sale")
    public Result<Product> onSale() {
        return Result.ok(productService.currentOnSale());
    }

    @GetMapping("/products")
    public Result<List<Product>> list() {
        return Result.ok(productService.listOnSale());
    }

    @GetMapping("/categories")
    public Result<List<String>> categories() {
        return Result.ok(productService.categories());
    }

    @GetMapping("/products/{id}")
    public Result<Product> detail(@PathVariable Long id) {
        return Result.ok(productService.getDetail(id));
    }

    // ===== 卖家端（需登录） =====

    /** 全部商品（含历史商品，只读） */
    @GetMapping("/seller/products")
    public Result<List<Product>> sellerList() {
        return Result.ok(productService.listAll());
    }

    /** 发布商品：直接「在售」；已有可购买商品时禁止发布 */
    @PostMapping("/seller/products")
    public Result<Product> publish(@Valid @RequestBody ProductReq req) {
        return Result.ok(productService.publish(req.name(), req.description(), req.imageUrl(),
                req.price(), req.category()));
    }

    @PutMapping("/seller/products/{id}")
    public Result<Product> update(@PathVariable Long id, @Valid @RequestBody ProductReq req) {
        return Result.ok(productService.update(id, req.name(), req.description(), req.imageUrl(),
                req.price(), req.category()));
    }

    /** 手动冻结：临时停售，冻结期间不接受新意向 */
    @PostMapping("/seller/products/{id}/freeze")
    public Result<Product> freeze(@PathVariable Long id) {
        return Result.ok(productService.freeze(id));
    }

    /** 解冻：恢复到在售 */
    @PostMapping("/seller/products/{id}/unfreeze")
    public Result<Product> unfreeze(@PathVariable Long id) {
        return Result.ok(productService.unfreeze(id));
    }

    /** 手动下架：进入历史商品，不可再上架 */
    @PostMapping("/seller/products/{id}/off-shelf")
    public Result<Product> offShelf(@PathVariable Long id) {
        return Result.ok(productService.offShelf(id));
    }

    @PostMapping("/seller/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        return Result.ok(productService.upload(file));
    }

    public record ProductReq(
            @NotBlank(message = "商品名称不能为空") String name,
            String description,
            String imageUrl,
            @NotNull(message = "价格不能为空")
            @DecimalMin(value = "0.01", message = "价格必须大于 0") BigDecimal price,
            String category
    ) {
    }
}
