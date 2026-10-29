package com.mall.repository;

import com.mall.entity.Product;
import com.mall.entity.enums.ProductStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    /** 当前唯一可购买的商品（在售 或 已恢复在售） */
    Optional<Product> findFirstByStatusIn(List<ProductStatus> statuses);

    boolean existsByStatusIn(List<ProductStatus> statuses);

    Optional<Product> findFirstByStatus(ProductStatus status);

    List<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status);

    List<Product> findAllByOrderByCreatedAtDesc();

    boolean existsByStatus(ProductStatus status);

    /** 可购买且有库存的商品列表（多商品浏览） */
    List<Product> findByStatusInAndStockGreaterThanOrderByCreatedAtDesc(List<ProductStatus> statuses, Integer stock);

    /** 提交意向时行锁读取商品，串行化库存扣减，防止超卖 */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    /** 搜索：名称/描述模糊匹配 + 一级/二级分类筛选，仅可购买且有库存 */
    @Query("select p from Product p where p.status in :statuses and p.stock > 0 " +
            "and (:kw is null or :kw = '' or lower(p.name) like lower(concat('%', :kw, '%')) " +
            "or lower(p.description) like lower(concat('%', :kw, '%'))) " +
            "and (:c1 is null or :c1 = '' or p.category = :c1) " +
            "and (:c2 is null or :c2 = '' or p.categoryL2 = :c2) " +
            "order by p.createdAt desc")
    List<Product> search(@Param("statuses") List<ProductStatus> statuses,
                         @Param("kw") String kw,
                         @Param("c1") String c1,
                         @Param("c2") String c2);
}
