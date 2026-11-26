package com.mall.service;

import com.mall.common.BizException;
import com.mall.dto.AddressView;
import com.mall.entity.Address;
import com.mall.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 收货地址簿（挑战 C.2）：
 * 1. 一个客户可维护多个地址，默认地址唯一；
 * 2. 删除 / 取消默认地址时自动把最早的一条补位为默认；
 * 3. 注册时填写的「默认交易地点」自动转成第一条地址，兼容挑战 A.2。
 */
@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    public List<AddressView> list(Long customerId) {
        return addressRepository.findByCustomerIdOrderByIsDefaultDescIdAsc(customerId)
                .stream().map(this::toView).toList();
    }

    @Transactional
    public AddressView create(Long customerId, String receiverName, String receiverPhone,
                              String region, String detail, Boolean isDefault) {
        validate(receiverName, receiverPhone, detail);
        boolean first = addressRepository.countByCustomerId(customerId) == 0;
        boolean makeDefault = first || Boolean.TRUE.equals(isDefault);
        if (makeDefault) {
            clearDefault(customerId);
        }
        Address address = addressRepository.save(Address.builder()
                .customerId(customerId)
                .receiverName(receiverName.trim())
                .receiverPhone(receiverPhone.trim())
                .region(region == null ? null : region.trim())
                .detail(detail.trim())
                .isDefault(makeDefault)
                .build());
        return toView(address);
    }

    @Transactional
    public AddressView update(Long customerId, Long id, String receiverName, String receiverPhone,
                              String region, String detail, Boolean isDefault) {
        Address address = getOwned(customerId, id);
        validate(receiverName, receiverPhone, detail);
        address.setReceiverName(receiverName.trim());
        address.setReceiverPhone(receiverPhone.trim());
        address.setRegion(region == null ? null : region.trim());
        address.setDetail(detail.trim());
        if (Boolean.TRUE.equals(isDefault)) {
            clearDefault(customerId);
            address.setIsDefault(true);
        } else if (Boolean.TRUE.equals(address.getIsDefault())
                && addressRepository.countByCustomerId(customerId) > 1) {
            // 取消默认时把默认让给其它地址，避免出现「没有默认地址」
            address.setIsDefault(false);
            addressRepository.save(address);
            promoteAnother(customerId, id);
            return toView(addressRepository.findById(id).orElse(address));
        }
        return toView(addressRepository.save(address));
    }

    @Transactional
    public void delete(Long customerId, Long id) {
        Address address = getOwned(customerId, id);
        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        addressRepository.delete(address);
        if (wasDefault) {
            promoteAnother(customerId, id);
        }
    }

    @Transactional
    public AddressView setDefault(Long customerId, Long id) {
        Address address = getOwned(customerId, id);
        clearDefault(customerId);
        address.setIsDefault(true);
        return toView(addressRepository.save(address));
    }

    public Address getOwned(Long customerId, Long id) {
        return addressRepository.findByIdAndCustomerId(id, customerId)
                .orElseThrow(() -> new BizException("收货地址不存在"));
    }

    public Optional<Address> findDefault(Long customerId) {
        return addressRepository.findFirstByCustomerIdAndIsDefaultTrue(customerId);
    }

    /** 注册时把「默认交易地点」落成第一条地址（A.2 兼容） */
    @Transactional
    public void initFromRegister(Long customerId, String username, String phone, String legacyAddress) {
        if (legacyAddress == null || legacyAddress.isBlank()) {
            return;
        }
        create(customerId, username, phone, null, legacyAddress, true);
    }

    // ===== 内部方法 =====

    private void clearDefault(Long customerId) {
        List<Address> all = addressRepository.findByCustomerId(customerId);
        for (Address a : all) {
            if (Boolean.TRUE.equals(a.getIsDefault())) {
                a.setIsDefault(false);
                addressRepository.save(a);
            }
        }
    }

    /** 从剩余地址里挑最早的一条设为默认 */
    private void promoteAnother(Long customerId, Long excludeId) {
        addressRepository.findByCustomerId(customerId).stream()
                .filter(a -> !a.getId().equals(excludeId))
                .min((a, b) -> a.getId().compareTo(b.getId()))
                .ifPresent(next -> {
                    next.setIsDefault(true);
                    addressRepository.save(next);
                });
    }

    private void validate(String receiverName, String receiverPhone, String detail) {
        if (receiverName == null || receiverName.isBlank()) {
            throw new BizException("收货人不能为空");
        }
        if (receiverPhone == null || !receiverPhone.trim().matches("^1\\d{10}$")) {
            throw new BizException("请填写正确的 11 位手机号");
        }
        if (detail == null || detail.isBlank()) {
            throw new BizException("详细地址不能为空");
        }
    }

    private AddressView toView(Address a) {
        return new AddressView(
                a.getId(),
                a.getReceiverName(),
                a.getReceiverPhone(),
                a.getRegion(),
                a.getDetail(),
                a.fullAddress(),
                Boolean.TRUE.equals(a.getIsDefault()),
                a.getCreatedAt()
        );
    }
}
