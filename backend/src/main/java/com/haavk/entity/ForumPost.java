package com.haavk.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.haavk.handler.CommaListTypeHandler;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 论坛帖子 forum_post
 */
@Data
@TableName(value = "forum_post", autoResultMap = true)
public class ForumPost implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String content;

    /** 配图地址列表（库里存逗号分隔的 varchar，接口层是数组） */
    @TableField(typeHandler = CommaListTypeHandler.class)
    private List<String> images;

    private Long authorId;

    @TableField(exist = false)
    private String authorName;

    @TableField(exist = false)
    private String authorAvatar;

    @TableField(exist = false)
    private String department;

    @TableField(exist = false)
    private String tag;

    /** 最后回复人（由最新回复推导，非表字段） */
    @TableField(exist = false)
    private String lastReplyBy;

    /** 最后回复时间（非表字段） */
    @TableField(exist = false)
    private LocalDateTime lastReplyAt;

    private Boolean pinned;

    /** DRAFT / ON_SALE / OFF_SALE */
    private String status;

    private Integer likes;

    private Integer replyCount;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
