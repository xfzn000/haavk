package com.haavk.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.haavk.common.BusinessException;
import com.haavk.common.PageResult;
import com.haavk.common.Roles;
import com.haavk.dto.PageQuery;
import com.haavk.entity.AdminUser;
import com.haavk.entity.Employee;
import com.haavk.mapper.AdminUserMapper;
import com.haavk.mapper.EmployeeMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 员工服务
 *
 * <p>论坛作者展示（姓名/头像/部门）与「注意力点数」账户都落在 employee 表；
 * 登录账号在 admin_user，两者通过 username == employee.name 关联。
 * 头像以个人中心（admin_user.avatar）为准：发帖/回复时同步，展示时兜底回退。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeService {

    /** 注意力点数：普通用户每日满额 */
    public static final int DEFAULT_POINTS_USER = 10_000;
    /** 注意力点数：管理员每日满额 */
    public static final int DEFAULT_POINTS_ADMIN = 1_000_000;
    /** 发帖消耗 */
    public static final int POST_COST = 100;
    /** 回复消耗 */
    public static final int REPLY_COST = 50;

    private final EmployeeMapper employeeMapper;
    private final AdminUserMapper adminUserMapper;

    /** 员工缓存（id -> Employee），用于填充发帖人信息 */
    private volatile Map<Long, Employee> cache = Map.of();

    @PostConstruct
    public void warmUp() {
        refreshCache();
    }

    public void refreshCache() {
        try {
            cache = employeeMapper.selectList(null).stream()
                    .collect(Collectors.toMap(Employee::getId, Function.identity()));
        } catch (Exception ignored) {
            // 数据库未就绪时不影响启动
        }
    }

    public Employee getById(Long id) {
        if (id == null) return null;
        Employee e = cache.get(id);
        return e != null ? e : employeeMapper.selectById(id);
    }

    public Employee findByName(String name) {
        if (name == null || name.isBlank()) return null;
        return employeeMapper.selectOne(new LambdaQueryWrapper<Employee>()
                .eq(Employee::getName, name.trim())
                .last("LIMIT 1"));
    }

    /** 登录账号的角色（admin_user.role）；查不到按普通用户处理 */
    public String roleOf(String username) {
        if (username == null || username.isBlank()) return Roles.USER;
        AdminUser u = adminUserMapper.selectOne(new LambdaQueryWrapper<AdminUser>()
                .eq(AdminUser::getUsername, username.trim())
                .last("LIMIT 1"));
        return u != null && StringUtils.hasText(u.getRole()) ? u.getRole() : Roles.USER;
    }

    /** 角色对应的每日满额点数 */
    public int defaultPoints(String username) {
        return Roles.ADMIN.equalsIgnoreCase(roleOf(username))
                ? DEFAULT_POINTS_ADMIN
                : DEFAULT_POINTS_USER;
    }

    /** 登录账号在个人中心设置的头像（可能为 null） */
    public String adminAvatarOf(String username) {
        if (username == null || username.isBlank()) return null;
        AdminUser u = adminUserMapper.selectOne(new LambdaQueryWrapper<AdminUser>()
                .eq(AdminUser::getUsername, username.trim())
                .last("LIMIT 1"));
        return u != null && StringUtils.hasText(u.getAvatar()) ? u.getAvatar() : null;
    }

    /**
     * 为登录账号找到（或创建）对应的员工档案。
     * 登录账号来自 admin_user，论坛作者需要一条 employee 记录才能展示姓名/头像/部门。
     * 每次调用都会把个人中心的头像同步过来（改了头像论坛立刻生效）。
     */
    public Employee findOrCreateForUser(String username) {
        if (username == null || username.isBlank()) {
            throw new BusinessException("无法识别当前登录用户");
        }
        String uname = username.trim();
        Employee exist = findByName(uname);
        String adminAvatar = adminAvatarOf(uname);

        if (exist != null) {
            // 头像以个人中心为准：不一致就同步（含个人中心清空头像的情形）
            String target = adminAvatar != null ? adminAvatar : "";
            if (!target.equals(exist.getAvatar() == null ? "" : exist.getAvatar())) {
                exist.setAvatar(target);
                employeeMapper.updateById(exist);
                refreshCache();
            }
            return exist;
        }

        Employee created = new Employee();
        created.setName(uname);
        created.setAvatar(adminAvatar != null ? adminAvatar : "");
        created.setDepartment("集团员工");
        created.setRole("注册用户");
        // 新档案直接给当日满额点数
        created.setAttentionPoints(defaultPoints(uname));
        created.setPointsResetDate(LocalDate.now());
        created.setStatus(1);
        employeeMapper.insert(created);
        refreshCache();
        return created;
    }

    /**
     * 取当前有效注意力点数 —— **每天重置**：
     * `points_reset_date` 不是今天（含 null）时，先把点数恢复为角色对应满额再返回。
     */
    public int currentPoints(Employee e) {
        if (e == null) throw new BusinessException("员工不存在");
        LocalDate today = LocalDate.now();
        if (e.getPointsResetDate() == null || !today.equals(e.getPointsResetDate())) {
            e.setAttentionPoints(defaultPoints(e.getName()));
            e.setPointsResetDate(today);
            employeeMapper.updateById(e);
            refreshCache();
            log.info("注意力点数每日重置: {} -> {}", e.getName(), e.getAttentionPoints());
        }
        Integer p = e.getAttentionPoints();
        return p == null ? 0 : p;
    }

    /** 注意力点数不足时抛出业务异常（扣减前先做每日重置） */
    public void consumeAttentionPoints(Long employeeId, int points) {
        if (points <= 0) return;
        Employee e = getById(employeeId);
        if (e == null) throw new BusinessException("员工不存在");
        int current = currentPoints(e);
        if (current < points) {
            throw new BusinessException(
                    String.format("注意力点数不足（剩余 %d，本次需 %d），明天将重置为满额", current, points));
        }
        e.setAttentionPoints(current - points);
        employeeMapper.updateById(e);
        refreshCache();
    }

    /** 当前有效点数（供「我的点数」接口用）：findOrCreate 保证注册即有账户，再做每日重置 */
    public int effectivePointsOf(String username) {
        return currentPoints(findOrCreateForUser(username));
    }

    /**
     * 论坛展示用头像：员工档案有就用档案的（历史数据可能存过别的图），
     * 没有则回退到登录账号（admin_user.avatar，个人中心设置的头像）。
     */
    public String resolveAvatar(Employee e) {
        if (e == null) return null;
        if (StringUtils.hasText(e.getAvatar())) return e.getAvatar();
        return adminAvatarOf(e.getName());
    }

    public List<Employee> list() {
        return employeeMapper.selectList(new LambdaQueryWrapper<Employee>().orderByAsc(Employee::getId));
    }

    public PageResult<Employee> page(PageQuery query) {
        LambdaQueryWrapper<Employee> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(Employee::getName, query.getKeyword())
                    .or().like(Employee::getDepartment, query.getKeyword());
        }
        wrapper.orderByAsc(Employee::getId);
        Page<Employee> page = employeeMapper.selectPage(new Page<>(query.getPage(), query.getPageSize()), wrapper);
        return PageResult.of(page.getRecords(), page.getTotal(), page.getCurrent(), page.getSize());
    }
}
