package com.haavk.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 操作日志 operation_log
 */
@Data
@TableName("operation_log")
public class OperationLog implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String admin;

    /** 登录 / 新增 / 编辑 / 删除 / 上架 / 下架 / 置顶 / 恢复 */
    private String action;

    private String target;

    private String ip;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
