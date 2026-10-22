package com.mall.controller;

import com.mall.common.Result;
import com.mall.dto.IntentView;
import com.mall.entity.Customer;
import com.mall.service.CustomerService;
import com.mall.service.IntentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 商家查看注册客户及其购买历史。
 */
@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
public class SellerCustomerController {

    private final CustomerService customerService;
    private final IntentService intentService;

    /** 所有注册客户（不返回密码） */
    @GetMapping("/customers")
    public Result<List<Map<String, Object>>> list() {
        return Result.ok(customerService.listAll().stream().map(this::toView).toList());
    }

    /** 指定客户的购买历史 */
    @GetMapping("/customers/{id}/orders")
    public Result<List<IntentView>> orders(@PathVariable Long id) {
        return Result.ok(intentService.listByCustomer(id));
    }

    private Map<String, Object> toView(Customer c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("username", c.getUsername());
        m.put("phone", c.getPhone());
        m.put("defaultAddress", c.getDefaultAddress());
        m.put("createdAt", c.getCreatedAt());
        return m;
    }
}
