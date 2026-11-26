package com.mall.repository;

import com.mall.entity.AfterSaleLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AfterSaleLogRepository extends JpaRepository<AfterSaleLog, Long> {

    List<AfterSaleLog> findByAfterSaleIdOrderByIdAsc(Long afterSaleId);
}
