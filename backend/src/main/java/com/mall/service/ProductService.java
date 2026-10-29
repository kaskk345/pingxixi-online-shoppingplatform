package com.mall.service;

import com.mall.common.BizException;
import com.mall.entity.Product;
import com.mall.entity.PurchaseIntent;
import com.mall.entity.enums.IntentStatus;
import com.mall.entity.enums.ProductStatus;
import com.mall.repository.ProductRepository;
import com.mall.repository.PurchaseIntentRepository;
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
 * 商品服务（升级版：多商品 + 二级分类 + 库存）。
 *
 * 库存策略：提交购买意向即预占 1 件库存（行锁串行化，防止超卖）；
 * 交易失败 / 买家撤销 / 意向作废 / 商品下架时释放预占库存；
 * 库存归零自动下架，库存恢复且为「自动下架」时自动重新上架。
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    /** 可被购买 / 可提交意向的状态 */
    private static final List<ProductStatus> BUYABLE = List.of(ProductStatus.ON_SALE, ProductStatus.RESTORED);

    private final ProductRepository productRepository;
    private final PurchaseIntentRepository intentRepository;

    @Value("${mall.upload-dir:uploads}")
    private String uploadDir;

    // ===== 查询 =====

    /** 兼容旧接口：返回第一件可购买商品 */
    public Product currentOnSale() {
        return productRepository.findFirstByStatusIn(BUYABLE).orElse(null);
    }

    /** 买家端：所有可购买且有库存的商品（多商品） */
    public List<Product> listOnSale() {
        return productRepository.findByStatusInAndStockGreaterThanOrderByCreatedAtDesc(BUYABLE, 0);
    }

    /** 搜索 / 浏览：关键词 + 一级/二级分类，仅可购买且有库存 */
    public List<Product> search(String keyword, String categoryL1, String categoryL2) {
        return productRepository.search(BUYABLE, keyword, categoryL1, categoryL2);
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

    /** 发布商品：支持多商品、库存、二级分类、多图 */
    @Transactional
    public Product publish(String name, String description, String imageUrl, String images,
                           BigDecimal price, String category, String categoryL2, Integer stock) {
        int s = (stock == null || stock < 0) ? 1 : stock;
        Product p = Product.builder()
                .name(name).description(description).imageUrl(imageUrl).images(images)
                .price(price).category(category).categoryL2(categoryL2)
                .stock(s)
                .status(s > 0 ? ProductStatus.ON_SALE : ProductStatus.OFF_SHELF)
                .autoOffShelf(s <= 0)
                .build();
        return productRepository.save(p);
    }

    /** 编辑商品：修改信息与库存；库存为 0 自动下架 */
    @Transactional
    public Product update(Long id, String name, String description, String imageUrl, String images,
                          BigDecimal price, String category, String categoryL2, Integer stock) {
        Product p = getDetail(id);
        if (name != null) p.setName(name);
        if (description != null) p.setDescription(description);
        if (imageUrl != null) p.setImageUrl(imageUrl);
        if (images != null) p.setImages(images);
        if (price != null) p.setPrice(price);
        if (category != null) p.setCategory(category);
        if (categoryL2 != null) p.setCategoryL2(categoryL2);
        if (stock != null) {
            p.setStock(stock);
            if (stock <= 0) {
                p.setStatus(ProductStatus.OFF_SHELF);
                p.setAutoOffShelf(true);
            } else {
                if (p.getStatus() == ProductStatus.OFF_SHELF) {
                    p.setStatus(ProductStatus.ON_SALE);
                }
                p.setAutoOffShelf(false);
            }
        }
        return productRepository.save(p);
    }

    /** 卖家手动冻结：临时停售，冻结期间不接受新意向 */
    @Transactional
    public Product freeze(Long id) {
        Product p = getDetail(id);
        boolean autoOff = p.getStatus() == ProductStatus.OFF_SHELF && Boolean.TRUE.equals(p.getAutoOffShelf());
        if (!p.getStatus().buyable() && !autoOff) {
            throw new BizException("仅「在售 / 已恢复在售」商品可冻结");
        }
        p.setStatus(ProductStatus.FROZEN);
        return productRepository.save(p);
    }

    /** 卖家手动解冻：恢复到在售（需有库存） */
    @Transactional
    public Product unfreeze(Long id) {
        Product p = getDetail(id);
        if (p.getStatus() != ProductStatus.FROZEN) {
            throw new BizException("仅「已冻结」商品可解冻");
        }
        if (p.getStock() == null || p.getStock() <= 0) {
            throw new BizException("库存为 0，无法解冻");
        }
        p.setStatus(ProductStatus.ON_SALE);
        p.setAutoOffShelf(false);
        return productRepository.save(p);
    }

    /** 卖家手动下架：进入历史商品，未交易的等候意向一并作废，并释放其预占库存 */
    @Transactional
    public Product offShelf(Long id) {
        Product p = getDetail(id);
        if (!p.getStatus().buyable() && p.getStatus() != ProductStatus.FROZEN) {
            throw new BizException("仅「在售 / 已恢复在售 / 已冻结」商品可手动下架");
        }
        List<PurchaseIntent> waiting = intentRepository
                .findByProductIdAndStatusOrderByQueueTimeAsc(id, IntentStatus.WAITING);
        for (PurchaseIntent other : waiting) {
            other.setStatus(IntentStatus.VOID);
            intentRepository.save(other);
        }
        // 被作废的等候意向预占的库存要释放回商品（手动下架不自动上架）
        for (int i = 0; i < waiting.size(); i++) {
            releaseStock(id);
        }
        Product fresh = getDetail(id);
        fresh.setStatus(ProductStatus.OFF_SHELF);
        fresh.setAutoOffShelf(false);
        return productRepository.save(fresh);
    }

    /** 交易成功：本单库存在提交意向时已预占，这里只落定销量与商品状态，不再重复扣减 */
    @Transactional
    public Product markSoldByTrade(Long productId) {
        Product p = getDetail(productId);
        if (p.getStatus() != ProductStatus.FROZEN) {
            throw new BizException("仅「已冻结」商品可标记交易成功");
        }
        p.setSales((p.getSales() == null ? 0 : p.getSales()) + 1);
        p.setSoldAt(LocalDateTime.now());
        int left = p.getStock() == null ? 0 : p.getStock();
        if (left <= 0) {
            p.setStock(0);
            p.setStatus(ProductStatus.OFF_SHELF);
            p.setAutoOffShelf(true);
        } else {
            p.setStatus(ProductStatus.ON_SALE);
            p.setAutoOffShelf(false);
        }
        return productRepository.save(p);
    }

    /** 交易失败：释放本单预占的库存，商品恢复在售 */
    @Transactional
    public Product markRestoredByTrade(Long productId) {
        Product p = getDetail(productId);
        if (p.getStatus() != ProductStatus.FROZEN) {
            throw new BizException("仅「已冻结」商品可标记交易失败");
        }
        p.setStock((p.getStock() == null ? 0 : p.getStock()) + 1);
        p.setStatus(ProductStatus.RESTORED);
        p.setAutoOffShelf(false);
        return productRepository.save(p);
    }

    // ===== 库存预占 / 释放（提交意向即扣，防止超卖） =====

    /** 预占 1 件库存（提交意向时调用）；行锁串行化，返回 false 表示库存不足或不可售 */
    @Transactional
    public boolean reserveStock(Long productId) {
        Product p = productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new BizException("商品不存在"));
        if (!p.getStatus().buyable()) {
            return false;
        }
        int stock = p.getStock() == null ? 0 : p.getStock();
        if (stock <= 0) {
            return false;
        }
        int left = stock - 1;
        p.setStock(left);
        if (left <= 0) {
            p.setStatus(ProductStatus.OFF_SHELF);
            p.setAutoOffShelf(true);
        }
        productRepository.save(p);
        return true;
    }

    /** 释放 1 件预占库存（撤销 / 交易失败 / 作废时调用）；若因此恢复库存则自动重新上架 */
    @Transactional
    public void releaseStock(Long productId) {
        Product p = productRepository.findByIdForUpdate(productId).orElse(null);
        if (p == null) {
            return;
        }
        p.setStock((p.getStock() == null ? 0 : p.getStock()) + 1);
        if (Boolean.TRUE.equals(p.getAutoOffShelf()) && p.getStatus() == ProductStatus.OFF_SHELF) {
            p.setStatus(ProductStatus.ON_SALE);
            p.setAutoOffShelf(false);
        }
        productRepository.save(p);
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
