package com.mall.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mall.common.Result;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 客户接口鉴权：拦截 /api/customer/**（注册、登录除外）。
 */
@Component
public class CustomerInterceptor implements HandlerInterceptor {

    private final CustomerTokenStore tokenStore;
    private final ObjectMapper mapper = new ObjectMapper();

    public CustomerInterceptor(CustomerTokenStore tokenStore) {
        this.tokenStore = tokenStore;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String token = request.getHeader("X-Token");
        Long customerId = tokenStore.get(token);
        if (customerId == null) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(mapper.writeValueAsString(Result.fail(401, "未登录或登录已过期")));
            return false;
        }
        request.setAttribute("customerId", customerId);
        return true;
    }
}
