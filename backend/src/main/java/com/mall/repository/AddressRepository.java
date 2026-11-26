package com.mall.repository;

import com.mall.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByCustomerIdOrderByIsDefaultDescIdAsc(Long customerId);

    List<Address> findByCustomerId(Long customerId);

    Optional<Address> findByIdAndCustomerId(Long id, Long customerId);

    Optional<Address> findFirstByCustomerIdAndIsDefaultTrue(Long customerId);

    long countByCustomerId(Long customerId);
}
