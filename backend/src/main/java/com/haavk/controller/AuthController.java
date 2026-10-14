package com.haavk.controller;

import com.haavk.common.Result;
import com.haavk.common.Roles;
import com.haavk.dto.LoginDTO;
import com.haavk.dto.PasswordDTO;
import com.haavk.dto.ProfileDTO;
import com.haavk.dto.RegisterDTO;
import com.haavk.service.AuthService;
import com.haavk.vo.LoginVO;
import com.haavk.vo.ProfileVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 认证接口
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** 登录 */
    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto, HttpServletRequest request) {
        return Result.success(authService.login(dto, clientIp(request)));
    }

    /** 注册（成功后直接返回 Token） */
    @PostMapping("/register")
    public Result<LoginVO> register(@Valid @RequestBody RegisterDTO dto, HttpServletRequest request) {
        return Result.success("注册成功", authService.register(dto, clientIp(request)));
    }

    /** 当前登录用户 */
    @GetMapping("/me")
    public Result<Map<String, Object>> me(Authentication authentication) {
        String name = authentication != null ? authentication.getName() : null;
        if (name == null) {
            return Result.failure(com.haavk.common.ResultCode.UNAUTHORIZED);
        }
        var user = authService.findByUsername(name);
        return Result.success(Map.of(
                "username", name,
                "nickname", user != null && user.getNickname() != null ? user.getNickname() : name,
                "role", user != null && user.getRole() != null ? user.getRole() : Roles.USER));
    }

    /** 个人中心：读取当前用户完整资料 */
    @GetMapping("/profile")
    public Result<ProfileVO> profile(Authentication authentication) {
        return Result.success(authService.getProfile(currentName(authentication)));
    }

    /** 个人中心：修改昵称 / 头像 */
    @PutMapping("/profile")
    public Result<ProfileVO> updateProfile(@Valid @RequestBody ProfileDTO dto,
                                           Authentication authentication,
                                           HttpServletRequest request) {
        return Result.success("资料已更新",
                authService.updateProfile(currentName(authentication), dto, clientIp(request)));
    }

    /** 个人中心：修改密码（校验原密码） */
    @PutMapping("/password")
    public Result<Void> changePassword(@Valid @RequestBody PasswordDTO dto,
                                       Authentication authentication,
                                       HttpServletRequest request) {
        authService.changePassword(currentName(authentication), dto, clientIp(request));
        return Result.success("密码已修改，请重新登录", null);
    }

    /** 取当前登录用户名，未登录直接 401 */
    private String currentName(Authentication authentication) {
        String name = authentication != null ? authentication.getName() : null;
        if (name == null) {
            throw new com.haavk.common.BusinessException(
                    com.haavk.common.ResultCode.UNAUTHORIZED.getCode(), "请先登录");
        }
        return name;
    }

    private String clientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = request.getRemoteAddr();
        return ip.contains(",") ? ip.split(",")[0].trim() : ip;
    }
}
