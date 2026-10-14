package com.haavk.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.haavk.handler.CommaListTypeHandler;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 论坛回复 forum_reply
 */
@Data
@TableName(value = "forum_reply", autoResultMap = true)
public class ForumReply implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long postId;

    private Long authorId;

    @TableField(exist = false)
    private String authorName;

    @TableField(exist = false)
    private String authorAvatar;

    @TableField(exist = false)
    private String department;

    @TableField(exist = false)
    private String tag;

    private String content;

    /** 配图地址列表（库里存逗号分隔的 varchar，接口层是数组） */
    @TableField(typeHandler = CommaListTypeHandler.class)
    private List<String> images;

    private String status;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
