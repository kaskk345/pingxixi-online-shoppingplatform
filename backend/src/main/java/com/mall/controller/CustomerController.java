package com.mall.controller;

import com.mall.common.Result;
import com.mall.dto.IntentView;
import com.mall.entity.Customer;
import com.mall.service.CustomerService;
import com.mall.service.IntentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 客户注册、登录、个人信息与历史订单。
 * 除 register/login 外均需客户 token（由 CustomerInterceptor 校验）。
 */
@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final IntentService intentService;

    @PostMapping("/register")
    public Result<Map<String, Object>> register(@Valid @RequestBody RegisterReq req) {
        Customer c = customerService.register(req.username(), req.password(), req.phone(), req.defaultAddress());
        return Result.ok(Map.of("id", c.getId(), "username", c.getUsername()));
    }

    @PostMapping("/login")
    public Result<Map<String, String>> login(@Valid @RequestBody LoginReq req) {
        String token = customerService.login(req.username(), req.password());
        return Result.ok(Map.of("token", token));
    }

    @GetMapping("/me")
    public Result<Customer> me(@RequestAttribute("customerId") Long customerId) {
        return Result.ok(customerService.get(customerId));
    }

    /** 客户历史下单记录 */
    @GetMapping("/orders")
    public Result<List<IntentView>> orders(@RequestAttribute("customerId") Long customerId) {
        return Result.ok(intentService.listByCustomer(customerId));
    }

    public record RegisterReq(
            @NotBlank(message = "用户名不能为空") String username,
            @NotBlank(message = "密码不能为空")
            @Size(min = 6, max = 30, message = "密码长度需在 6-30 位之间") String password,
            @NotBlank(message = "联系电话不能为空") String phone,
            String defaultAddress
    ) {
    }

    public record LoginReq(
            @NotBlank(message = "用户名不能为空") String username,
            @NotBlank(message = "密码不能为空") String password
    ) {
    }
}
