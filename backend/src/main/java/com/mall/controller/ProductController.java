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

    @GetMapping("/products/on-sale")
    public Result<Product> onSale() {
        return Result.ok(productService.getOnSale());
    }

    @GetMapping("/products/{id}")
    public Result<Product> detail(@PathVariable Long id) {
        return Result.ok(productService.getDetail(id));
    }

    // ===== 卖家端（需登录） =====

    @GetMapping("/seller/products")
    public Result<List<Product>> list() {
        return Result.ok(productService.listAll());
    }

    @PostMapping("/seller/products")
    public Result<Product> publish(@Valid @RequestBody ProductReq req) {
        return Result.ok(productService.publish(req.name(), req.description(), req.imageUrl(), req.price()));
    }

    @PutMapping("/seller/products/{id}")
    public Result<Product> update(@PathVariable Long id, @Valid @RequestBody ProductReq req) {
        return Result.ok(productService.update(id, req.name(), req.description(), req.imageUrl(), req.price()));
    }

    @PostMapping("/seller/products/{id}/freeze")
    public Result<Product> freeze(@PathVariable Long id) {
        return Result.ok(productService.freeze(id));
    }

    @PostMapping("/seller/products/{id}/restore")
    public Result<Product> restore(@PathVariable Long id) {
        return Result.ok(productService.restore(id));
    }

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
            @DecimalMin(value = "0.01", message = "价格必须大于 0") BigDecimal price
    ) {
    }
}
