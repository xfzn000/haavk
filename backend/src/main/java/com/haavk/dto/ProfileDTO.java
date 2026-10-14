package com.haavk.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

/**
 * 修改个人资料（昵称 / 头像）
 *
 * <p>两个字段都是可选的：只传哪个就改哪个（null = 不改）。
 * 头像地址必须是通过 {@code POST /api/upload} 拿到的 {@code /uploads/xxx.png}。
 */
@Data
public class ProfileDTO implements Serializable {

    @Size(max = 32, message = "昵称最长 32 个字符")
    private String nickname;

    @Size(max = 512, message = "头像地址过长")
    private String avatar;
}
