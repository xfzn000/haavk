package com.haavk.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 后台管理员账号 admin_user
 */
@Data
@TableName("admin_user")
public class AdminUser implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;

    /** BCrypt 散列，永不返回给前端 */
    @JsonIgnore
    private String password;

    private String nickname;

    /** 头像地址（走 POST /api/upload 拿到 /uploads/xxx.png 后再存这里） */
    private String avatar;

    /** role 是 MySQL 8 保留字，需反引号包裹 */
    @TableField("`role`")
    private String role;

    /** 1 启用 / 0 禁用 */
    private Integer status;

    private LocalDateTime lastLogin;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
