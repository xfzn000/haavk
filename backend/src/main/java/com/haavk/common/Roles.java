package com.haavk.common;

/**
 * 账号角色常量（对应 `admin_user.role`）
 *
 * <ul>
 *   <li>{@link #ADMIN} 管理员 —— 可以进入后台管理（`/admin/**`）</li>
 *   <li>{@link #USER} 普通用户 —— 只能浏览前台（论坛只读 / 发帖 / 寻人启事）</li>
 * </ul>
 *
 * <p><b>新注册账号一律是 {@link #USER}</b>；要提权只能直接改数据库：
 * <pre>UPDATE admin_user SET role = 'ADMIN' WHERE username = 'xxx';</pre>
 * 改完需要重新登录（角色随登录态一起返回给前端）。
 */
public final class Roles {

    /** 管理员：能进后台 */
    public static final String ADMIN = "ADMIN";

    /** 普通用户：只能浏览前台（默认角色） */
    public static final String USER = "USER";

    private Roles() {
    }

    /** 是否管理员 */
    public static boolean isAdmin(String role) {
        return ADMIN.equalsIgnoreCase(role);
    }
}
