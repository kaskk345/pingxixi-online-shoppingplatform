package com.mall.service;

import com.mall.auth.TokenStore;
import com.mall.common.BizException;
import com.mall.entity.Seller;
import com.mall.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerRepository sellerRepository;
    private final TokenStore tokenStore;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public String login(String username, String password) {
        Seller seller = sellerRepository.findByUsername(username)
                .orElseThrow(() -> new BizException("用户名或密码错误"));
        if (!encoder.matches(password, seller.getPassword())) {
            throw new BizException("用户名或密码错误");
        }
        return tokenStore.create(seller.getId());
    }

    @Transactional
    public void changePassword(Long sellerId, String oldPassword, String newPassword) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new BizException("账号不存在"));
        if (!encoder.matches(oldPassword, seller.getPassword())) {
            throw new BizException("原密码错误");
        }
        seller.setPassword(encoder.encode(newPassword));
        sellerRepository.save(seller);
    }
}
