package com.mall.repository;

import com.mall.entity.PurchaseIntent;
import com.mall.entity.enums.IntentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PurchaseIntentRepository extends JpaRepository<PurchaseIntent, Long> {

    List<PurchaseIntent> findAllByOrderByQueueTimeAsc();

    /** 卖家后台：按先到先得（排队时间正序）展示 */
    List<PurchaseIntent> findByProductIdOrderByQueueTimeAsc(Long productId);

    List<PurchaseIntent> findByProductIdAndStatusOrderByQueueTimeAsc(Long productId, IntentStatus status);

    long countByProductIdAndStatusAndQueueTimeBefore(Long productId, IntentStatus status, java.time.LocalDateTime time);

    Optional<PurchaseIntent> findByCode(String code);

    Optional<PurchaseIntent> findByCodeAndStatus(String code, IntentStatus status);
}
