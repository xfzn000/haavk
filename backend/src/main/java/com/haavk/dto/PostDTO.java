package com.haavk.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 帖子新增 / 编辑
 */
@Data
public class PostDTO implements Serializable {

    private Long id;

    @NotBlank(message = "标题不能为空")
    private String title;

    /** 正文：允许只发图不写字，所以这里不用 @NotBlank，由 Service 校验「正文与配图至少有一个」 */
    private String content;

    /** 配图地址列表（先调 POST /api/upload 拿到地址，再带过来） */
    private List<String> images;

    private Long authorId;

    private Boolean pinned;

    /** DRAFT / ON_SALE / OFF_SALE */
    private String status;

    private Integer likes;
}
