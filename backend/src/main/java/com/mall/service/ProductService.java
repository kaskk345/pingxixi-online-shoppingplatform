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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Value("${mall.upload-dir:uploads}")
    private String uploadDir;

    public Product getOnSale() {
        return productRepository.findFirstByStatus(ProductStatus.ON_SALE).orElse(null);
    }

    public Product getDetail(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new BizException("商品不存在"));
    }

    public List<Product> listAll() {
        return productRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Product publish(String name, String description, String imageUrl, BigDecimal price) {
        if (productRepository.existsByStatus(ProductStatus.ON_SALE)
                || productRepository.existsByStatus(ProductStatus.FROZEN)) {
            throw new BizException("当前已有在售或交易中的商品，请先售出或下架");
        }
        Product p = Product.builder()
                .name(name).description(description).imageUrl(imageUrl)
                .price(price).status(ProductStatus.ON_SALE).build();
        return productRepository.save(p);
    }

    @Transactional
    public Product update(Long id, String name, String description, String imageUrl, BigDecimal price) {
        Product p = getDetail(id);
        if (p.getStatus() == ProductStatus.SOLD) {
            throw new BizException("已售出商品不可编辑");
        }
        p.setName(name);
        p.setDescription(description);
        p.setImageUrl(imageUrl);
        p.setPrice(price);
        return productRepository.save(p);
    }

    @Transactional
    public Product freeze(Long id) {
        Product p = getDetail(id);
        if (p.getStatus() != ProductStatus.ON_SALE) {
            throw new BizException("仅「在售」商品可冻结");
        }
        p.setStatus(ProductStatus.FROZEN);
        return productRepository.save(p);
    }

    @Transactional
    public Product restore(Long id) {
        Product p = getDetail(id);
        if (p.getStatus() != ProductStatus.FROZEN) {
            throw new BizException("仅「冻结」商品可恢复上线");
        }
        p.setStatus(ProductStatus.ON_SALE);
        return productRepository.save(p);
    }

    @Transactional
    public Product offShelf(Long id) {
        Product p = getDetail(id);
        if (p.getStatus() == ProductStatus.SOLD) {
            throw new BizException("已售出商品不可下架");
        }
        p.setStatus(ProductStatus.OFF_SHELF);
        return productRepository.save(p);
    }

    @Transactional
    public Product markSold(Long id) {
        Product p = getDetail(id);
        if (p.getStatus() != ProductStatus.FROZEN) {
            throw new BizException("仅「冻结」商品可标记售出");
        }
        p.setStatus(ProductStatus.SOLD);
        p.setSoldAt(LocalDateTime.now());
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
