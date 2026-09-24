package com.mall.auth;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 轻量内存 Token 存储（演示用）。
 * 生产环境建议替换为 Redis + JWT。
 */
@Component
public class TokenStore {

    private final Map<String, Long> tokens = new ConcurrentHashMap<>();

    public String create(Long sellerId) {
        String token = UUID.randomUUID().toString().replace("-", "");
        tokens.put(token, sellerId);
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
