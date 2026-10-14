package com.haavk.vo;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 当前登录用户资料（个人中心页用）
 *
 * <p>不含密码。`role` 决定前端是否显示「后台管理」入口。
 */
@Data
public class ProfileVO implements Serializable {

    private Long id;

    /** 登录名（只读，不可修改） */
    private String username;

    /** 昵称（可修改） */
    private String nickname;

    /** 头像地址（可修改，/uploads/xxx.png），可能为 null */
    private String avatar;

    /** 角色：ADMIN=管理员 / USER=普通用户 */
    private String role;

    /** 1 启用 / 0 禁用 */
    private Integer status;

    /** 上次登录时间 */
    private LocalDateTime lastLogin;

    /** 注册时间 */
    private LocalDateTime createdAt;
}
