package com.haavk.config;

import com.haavk.entity.AdminUser;
import com.haavk.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 默认管理员账号初始化
 * ------------------------------------------------------------------
 * 首次启动（admin_user 表为空）时，使用 haavk.admin.* 配置创建默认账号，
 * 密码以 BCrypt 形式入库。生产环境请务必通过环境变量修改默认密码。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements ApplicationRunner {

    private final AuthService authService;
    private final com.haavk.mapper.AdminUserMapper adminUserMapper;
    private final PasswordEncoder passwordEncoder;

    @Value("${haavk.admin.username:admin}")
    private String defaultUsername;

    @Value("${haavk.admin.password:admin123}")
    private String defaultPassword;

    @Value("${haavk.admin.nickname:集团管理员}")
    private String defaultNickname;

    @Override
    public void run(ApplicationArguments args) {
        try {
            if (authService.count() > 0) return;

            AdminUser user = new AdminUser();
            user.setUsername(defaultUsername);
            user.setPassword(passwordEncoder.encode(defaultPassword));
            user.setNickname(defaultNickname);
            user.setRole("ADMIN");
            user.setStatus(1);
            adminUserMapper.insert(user);

            log.warn("已初始化默认管理员账号 [{}]，生产环境请立即修改密码！", defaultUsername);
        } catch (Exception e) {
            log.warn("默认管理员账号初始化跳过：{}", e.getMessage());
        }
    }
}
