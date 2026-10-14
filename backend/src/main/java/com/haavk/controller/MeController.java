package com.haavk.controller;

import com.haavk.common.Result;
import com.haavk.common.ResultCode;
import com.haavk.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 当前登录用户（/api/me/**）—— 需要登录
 *
 * <p>与前端 `api/attention.ts` 的既有契约一致：
 * `GET /api/me/attention-points` → `{ points, updatedAt }`。
 * 注意力点数**每天重置**：普通用户 10000 / 管理员 1000000（读和扣时惰性重置）。
 */
@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final EmployeeService employeeService;

    /** 我的注意力点数（右上角导航展示用；每日重置后的实时余额） */
    @GetMapping("/attention-points")
    public Result<Map<String, Object>> attentionPoints(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        if (username == null) {
            return Result.failure(ResultCode.UNAUTHORIZED);
        }
        int points = employeeService.effectivePointsOf(username);
        return Result.success(Map.of(
                "points", points,
                "updatedAt", LocalDateTime.now().toString()));
    }
}
