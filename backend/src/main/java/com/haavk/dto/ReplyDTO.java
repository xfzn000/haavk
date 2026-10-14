package com.haavk.dto;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 回复提交
 * 注意：作者不从这里传，由后端根据登录态确定。
 * 内容与配图「至少要有一个」，在 Service 里校验（允许只发图不写字，所以这里不用 @NotBlank）。
 */
@Data
public class ReplyDTO implements Serializable {

    private String content;

    /** 配图地址列表（先调 POST /api/upload 拿到地址，再带过来） */
    private List<String> images;
}
