package com.mall.controller;

import com.mall.common.Result;
import com.mall.dto.SellerIntentView;
import com.mall.entity.Product;
import com.mall.service.IntentService;
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
    private final IntentService intentService;

    // ===== 买家端 =====

    /** 兼容旧接口：第一件可购买商品 */
    @GetMapping("/products/on-sale")
    public Result<Product> onSale() {
        return Result.ok(productService.currentOnSale());
    }

    /** 商品列表（多商品，浏览用） */
    @GetMapping("/products")
    public Result<List<Product>> list() {
        return Result.ok(productService.listOnSale());
    }

    /** 搜索：关键词 + 一级/二级分类 */
    @GetMapping("/products/search")
    public Result<List<Product>> search(@RequestParam(required = false) String keyword,
                                        @RequestParam(required = false) String categoryL1,
                                        @RequestParam(required = false) String categoryL2) {
        return Result.ok(productService.search(keyword, categoryL1, categoryL2));
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

    /** 以商品为主体的交易历史（含终态、匿名买家与注册客户） */
    @GetMapping("/seller/products/{id}/history")
    public Result<List<SellerIntentView>> history(@PathVariable Long id) {
        return Result.ok(intentService.historyByProduct(id));
    }

    /** 发布商品：支持多商品、库存、二级分类、多图 */
    @PostMapping("/seller/products")
    public Result<Product> publish(@Valid @RequestBody ProductReq req) {
        return Result.ok(productService.publish(req.name(), req.description(), req.imageUrl(), req.images(),
                req.price(), req.category(), req.categoryL2(), req.stock()));
    }

    /** 编辑商品（含库存；库存为 0 自动下架） */
    @PutMapping("/seller/products/{id}")
    public Result<Product> update(@PathVariable Long id, @RequestBody ProductReq req) {
        return Result.ok(productService.update(id, req.name(), req.description(), req.imageUrl(), req.images(),
                req.price(), req.category(), req.categoryL2(), req.stock()));
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
            String images,
            @NotNull(message = "价格不能为空")
            @DecimalMin(value = "0.01", message = "价格必须大于 0") BigDecimal price,
            String category,
            String categoryL2,
            Integer stock
    ) {
    }
}
