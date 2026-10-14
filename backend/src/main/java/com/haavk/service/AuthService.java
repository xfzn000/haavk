package com.haavk.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.haavk.common.BusinessException;
import com.haavk.common.ResultCode;
import com.haavk.common.Roles;
import com.haavk.dto.LoginDTO;
import com.haavk.dto.PasswordDTO;
import com.haavk.dto.ProfileDTO;
import com.haavk.dto.RegisterDTO;
import com.haavk.entity.AdminUser;
import com.haavk.mapper.AdminUserMapper;
import com.haavk.security.JwtUtil;
import com.haavk.vo.LoginVO;
import com.haavk.vo.ProfileVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 认证服务：登录 / 注册
 * 账号存放在 admin_user 表，密码使用 BCrypt 散列，绝不存明文。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminUserMapper adminUserMapper;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final OperationLogService logService;

    /** 登录 */
    public LoginVO login(LoginDTO dto, String ip) {
        AdminUser user = findByUsername(dto.getUsername());
        if (user == null || !passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.UNAUTHORIZED.getCode(), "账号或密码错误");
        }
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BusinessException(ResultCode.FORBIDDEN.getCode(), "该账号已被禁用");
        }

        user.setLastLogin(LocalDateTime.now());
        adminUserMapper.updateById(user);

        String nickname = user.getNickname() != null ? user.getNickname() : user.getUsername();
        String role = user.getRole() != null ? user.getRole() : Roles.USER;
        logService.record(user.getUsername(), "登录", "系统", ip);
        return new LoginVO(jwtUtil.generate(user.getUsername(), role), user.getUsername(), nickname, role);
    }

    /** 注册（成功后直接返回 Token，即自动登录） */
    @Transactional
    public LoginVO register(RegisterDTO dto, String ip) {
        String username = dto.getUsername().trim();
        if (findByUsername(username) != null) {
            throw new BusinessException("用户名已存在，请更换");
        }

        AdminUser user = new AdminUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setNickname(dto.getNickname() == null || dto.getNickname().isBlank()
                ? username
                : dto.getNickname().trim());
        // 新注册账号一律是普通用户（USER），只能浏览前台；
        // 要变成管理员（能进后台）必须直接改数据库：UPDATE admin_user SET role='ADMIN' WHERE username='xxx';
        user.setRole(Roles.USER);
        user.setStatus(1);
        user.setLastLogin(LocalDateTime.now());
        adminUserMapper.insert(user);

        log.info("新账号注册成功: {}（角色 {}）", username, Roles.USER);
        logService.record(username, "注册", "系统", ip);
        return new LoginVO(jwtUtil.generate(username, Roles.USER), username, user.getNickname(), Roles.USER);
    }

    public AdminUser findByUsername(String username) {
        if (username == null || username.isBlank()) return null;
        return adminUserMapper.selectOne(new LambdaQueryWrapper<AdminUser>()
                .eq(AdminUser::getUsername, username.trim())
                .last("LIMIT 1"));
    }

    /** 读取当前登录用户资料（个人中心页） */
    public ProfileVO getProfile(String username) {
        AdminUser user = requireUser(username);
        ProfileVO vo = new ProfileVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname() != null ? user.getNickname() : user.getUsername());
        vo.setAvatar(user.getAvatar());
        vo.setRole(user.getRole() != null ? user.getRole() : Roles.USER);
        vo.setStatus(user.getStatus());
        vo.setLastLogin(user.getLastLogin());
        vo.setCreatedAt(user.getCreatedAt());
        return vo;
    }

    /**
     * 修改个人资料（昵称 / 头像）。
     * 字段为 null 或空串表示不改；头像必须是 /uploads/xxx 或 http(s) 外链。
     */
    @Transactional
    public ProfileVO updateProfile(String username, ProfileDTO dto, String ip) {
        AdminUser user = requireUser(username);

        boolean changed = false;
        if (dto.getNickname() != null && !dto.getNickname().isBlank()) {
            user.setNickname(dto.getNickname().trim());
            changed = true;
        }
        if (dto.getAvatar() != null && !dto.getAvatar().isBlank()) {
            String avatar = dto.getAvatar().trim();
            if (!avatar.startsWith("/uploads/") && !avatar.startsWith("http://") && !avatar.startsWith("https://")) {
                throw new BusinessException("头像地址不合法，请重新上传");
            }
            user.setAvatar(avatar);
            changed = true;
        }
        if (changed) {
            adminUserMapper.updateById(user);
            logService.record(username, "修改资料", "个人中心", ip);
        }
        return getProfile(username);
    }

    /** 修改密码：校验原密码 → BCrypt 存新密码 */
    @Transactional
    public void changePassword(String username, PasswordDTO dto, String ip) {
        AdminUser user = requireUser(username);
        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            throw new BusinessException("当前密码不正确");
        }
        if (passwordEncoder.matches(dto.getNewPassword(), user.getPassword())) {
            throw new BusinessException("新密码不能与当前密码相同");
        }
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        adminUserMapper.updateById(user);
        logService.record(username, "修改密码", "个人中心", ip);
    }

    private AdminUser requireUser(String username) {
        AdminUser user = findByUsername(username);
        if (user == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED.getCode(), "账号不存在，请重新登录");
        }
        return user;
    }

    public long count() {
        return adminUserMapper.selectCount(null);
    }
}
