package com.mall.auth;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 客户 Token 存储（与卖家 Token 分开，避免角色混淆）。
 */
@Component
public class CustomerTokenStore {

    private final Map<String, Long> tokens = new ConcurrentHashMap<>();

    public String create(Long customerId) {
        String token = UUID.randomUUID().toString().replace("-", "");
        tokens.put(token, customerId);
        return token;
    }

    public Long get(String token) {
        return token == null ? null : tokens.get(token);
    }

    public void remove(String token) {
        if (token != null) {
            tokens.remove(token);
        }
    }
}
