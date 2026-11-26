package com.mall.repository;

import com.mall.entity.Refund;
import com.mall.entity.enums.RefundStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface RefundRepository extends JpaRepository<Refund, Long> {

    List<Refund> findByAfterSaleIdOrderByIdDesc(Long afterSaleId);

    List<Refund> findByOrderIdOrderByIdDesc(Long orderId);

    @Query("select coalesce(sum(r.amount), 0) from Refund r "
            + "where r.orderId = :orderId and r.status = :status")
    BigDecimal sumAmountByOrder(@Param("orderId") Long orderId, @Param("status") RefundStatus status);
}
