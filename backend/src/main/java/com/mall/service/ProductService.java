package com.mall.service;

import com.mall.common.BizException;
import com.mall.entity.Product;
import com.mall.entity.enums.ProductStatus;
import com.mall.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * 商品服务（单品单卖 + 四态状态机）。
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    /** 可被购买 / 可提交意向的状态 */
    private static final List<ProductStatus> BUYABLE = List.of(ProductStatus.ON_SALE, ProductStatus.RESTORED);

    private final ProductRepository productRepository;

    @Value("${mall.upload-dir:uploads}")
    private String uploadDir;

    // ===== 查询 =====

    /** 买家端：当前可购买的唯一一件商品（没有则返回 null） */
    public Product currentOnSale() {
        return productRepository.findFirstByStatusIn(BUYABLE).orElse(null);
    }

    public List<Product> listOnSale() {
        return productRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(p -> p.getStatus().buyable())
                .toList();
    }

    public List<String> categories() {
        return listOnSale().stream()
                .map(Product::getCategory)
                .filter(Objects::nonNull)
                .filter(c -> !c.isBlank())
                .distinct()
                .toList();
    }

    public Product getDetail(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new BizException("商品不存在"));
    }

    public List<Product> listAll() {
        return productRepository.findAllByOrderByCreatedAtDesc();
    }

    // ===== 卖家操作 =====

    /** 发布商品：直接「在售」；单品单卖，已有一件可购买商品时禁止发布 */
    @Transactional
    public Product publish(String name, String description, String imageUrl, BigDecimal price, String category) {
        if (productRepository.existsByStatusIn(BUYABLE)) {
            throw new BizException("已有商品在售，需先完成当前商品交易或手动下架后再发布新商品");
        }
        Product p = Product.builder()
                .name(name).description(description).imageUrl(imageUrl)
                .price(price).category(category)
                .stock(1)
                .status(ProductStatus.ON_SALE).build();
        return productRepository.save(p);
    }

    /** 编辑商品：仅「在售 / 已恢复在售」可编辑；已下架、冻结中不可编辑 */
    @Transactional
    public Product update(Long id, String name, String description, String imageUrl, BigDecimal price, String category) {
        Product p = getDetail(id);
        if (p.getStatus() == ProductStatus.OFF_SHELF) {
            throw new BizException("已下架商品不可编辑（历史商品只读）");
        }
        if (p.getStatus() == ProductStatus.FROZEN) {
            throw new BizException("冻结中的商品不可编辑，请先解冻或完成交易");
        }
        p.setName(name);
        p.setDescription(description);
        p.setImageUrl(imageUrl);
        p.setPrice(price);
        p.setCategory(category);
        p.setStock(1);
        return productRepository.save(p);
    }

    /** 卖家手动冻结：临时停售，冻结期间不接受新意向 */
    @Transactional
    public Product freeze(Long id) {
        Product p = getDetail(id);
        if (!p.getStatus().buyable()) {
            throw new BizException("仅「在售 / 已恢复在售」商品可冻结");
        }
        p.setStatus(ProductStatus.FROZEN);
        return productRepository.save(p);
    }

    /** 卖家手动解冻：恢复到在售 */
    @Transactional
    public Product unfreeze(Long id) {
        Product p = getDetail(id);
        if (p.getStatus() != ProductStatus.FROZEN) {
            throw new BizException("仅「已冻结」商品可解冻");
        }
        p.setStatus(ProductStatus.ON_SALE);
        p.setStock(1);
        return productRepository.save(p);
    }

    /** 卖家手动下架：进入历史商品，不可再上架 */
    @Transactional
    public Product offShelf(Long id) {
        Product p = getDetail(id);
        if (!p.getStatus().buyable()) {
            throw new BizException("仅「在售 / 已恢复在售」商品可手动下架");
        }
        p.setStatus(ProductStatus.OFF_SHELF);
        return productRepository.save(p);
    }

    /** 交易成功：已冻结 -> 已下架（不用先解冻），商品进入历史 */
    @Transactional
    public Product markSoldByTrade(Long productId) {
        Product p = getDetail(productId);
        if (p.getStatus() != ProductStatus.FROZEN) {
            throw new BizException("仅「已冻结」商品可标记交易成功");
        }
        p.setStatus(ProductStatus.OFF_SHELF);
        p.setStock(0);
        p.setSales(p.getSales() == null ? 1 : p.getSales() + 1);
        p.setSoldAt(LocalDateTime.now());
        return productRepository.save(p);
    }

    /** 交易失败：已冻结 -> 已恢复在售 */
    @Transactional
    public Product markRestoredByTrade(Long productId) {
        Product p = getDetail(productId);
        if (p.getStatus() != ProductStatus.FROZEN) {
            throw new BizException("仅「已冻结」商品可标记交易失败");
        }
        p.setStatus(ProductStatus.RESTORED);
        p.setStock(1);
        return productRepository.save(p);
    }

    public String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BizException("请选择文件");
        }
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        String filename = UUID.randomUUID().toString().replace("-", "") + ext;
        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath();
            Files.createDirectories(dir);
            file.transferTo(dir.resolve(filename).toFile());
        } catch (IOException e) {
            throw new BizException("文件上传失败");
        }
        return "/uploads/" + filename;
    }
}
