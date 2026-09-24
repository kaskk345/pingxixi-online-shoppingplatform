package com.mall.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mall.common.Result;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final TokenStore tokenStore;
    private final ObjectMapper mapper = new ObjectMapper();

    public AuthInterceptor(TokenStore tokenStore) {
        this.tokenStore = tokenStore;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String token = request.getHeader("X-Token");
        Long sellerId = tokenStore.get(token);
        if (sellerId == null) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(mapper.writeValueAsString(Result.fail(401, "未登录或登录已过期")));
            return false;
        }
        request.setAttribute("sellerId", sellerId);
        return true;
    }
}
