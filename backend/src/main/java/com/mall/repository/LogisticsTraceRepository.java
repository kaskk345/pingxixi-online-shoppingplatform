package com.mall.repository;

import com.mall.entity.LogisticsTrace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogisticsTraceRepository extends JpaRepository<LogisticsTrace, Long> {

    List<LogisticsTrace> findByOrderIdOrderByOccurredAtDesc(Long orderId);

    List<LogisticsTrace> findByOrderIdOrderByOccurredAtAsc(Long orderId);
}
