package com.mall.service;

import com.mall.auth.CustomerTokenStore;
import com.mall.common.BizException;
import com.mall.entity.Customer;
import com.mall.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 客户注册、登录与信息查询。
 */
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerTokenStore tokenStore;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Transactional
    public Customer register(String username, String password, String phone, String defaultAddress) {
        if (username == null || username.isBlank()) {
            throw new BizException("用户名不能为空");
        }
        if (password == null || password.length() < 6) {
            throw new BizException("密码长度不能少于 6 位");
        }
        if (phone == null || phone.isBlank()) {
            throw new BizException("联系电话不能为空");
        }
        if (customerRepository.existsByUsername(username.trim())) {
            throw new BizException("用户名已存在");
        }
        return customerRepository.save(Customer.builder()
                .username(username.trim())
                .password(encoder.encode(password))
                .phone(phone.trim())
                .defaultAddress(defaultAddress)
                .build());
    }

    public String login(String username, String password) {
        Customer c = customerRepository.findByUsername(username)
                .orElseThrow(() -> new BizException("用户名或密码错误"));
        if (!encoder.matches(password, c.getPassword())) {
            throw new BizException("用户名或密码错误");
        }
        return tokenStore.create(c.getId());
    }

    public Customer get(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new BizException("客户不存在"));
    }

    public List<Customer> listAll() {
        return customerRepository.findAll();
    }
}
