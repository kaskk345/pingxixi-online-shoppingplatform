package com.mall.repository;

import com.mall.entity.PurchaseIntent;
import com.mall.entity.enums.IntentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PurchaseIntentRepository extends JpaRepository<PurchaseIntent, Long> {

    List<PurchaseIntent> findAllByOrderByCreatedAtDesc();

    List<PurchaseIntent> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<PurchaseIntent> findByProductIdAndStatus(Long productId, IntentStatus status);

    Optional<PurchaseIntent> findByBuyerPhoneAndProductIdAndStatus(String phone, Long productId, IntentStatus status);

    Optional<PurchaseIntent> findByIdAndBuyerPhone(Long id, String phone);
}
