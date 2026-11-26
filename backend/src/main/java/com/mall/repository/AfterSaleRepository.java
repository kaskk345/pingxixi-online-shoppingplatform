package com.mall.repository;

import com.mall.entity.AfterSale;
import com.mall.entity.enums.AfterSaleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AfterSaleRepository extends JpaRepository<AfterSale, Long> {

    List<AfterSale> findByCustomerIdOrderByIdDesc(Long customerId);

    List<AfterSale> findByOrderIdOrderByIdDesc(Long orderId);

    Optional<AfterSale> findByIdAndCustomerId(Long id, Long customerId);

    List<AfterSale> findByOrderItemId(Long orderItemId);

    boolean existsByOrderItemIdAndStatusIn(Long orderItemId, Collection<AfterSaleStatus> statuses);

    Page<AfterSale> findAllByOrderByIdDesc(Pageable pageable);

    Page<AfterSale> findByStatusOrderByIdDesc(AfterSaleStatus status, Pageable pageable);

    boolean existsByAfterSaleNo(String afterSaleNo);
}
