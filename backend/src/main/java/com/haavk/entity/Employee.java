package com.haavk.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 员工 employee
 */
@Data
@TableName("employee")
public class Employee implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String avatar;

    private String department;

    /** role 是 MySQL 8 保留字，需反引号包裹 */
    @TableField("`role`")
    private String role;

    /** 注意力点数（每天按角色重置：普通用户 10000 / 管理员 1000000） */
    private Integer attentionPoints;

    /** 上次重置注意力点数的日期（null 或不是今天 → 读取/扣减时重置为当日满额） */
    private LocalDate pointsResetDate;

    /** 1 正常 / 0 未注册 */
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
