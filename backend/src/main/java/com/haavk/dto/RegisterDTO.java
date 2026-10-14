package com.haavk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

/**
 * 注册
 */
@Data
public class RegisterDTO implements Serializable {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 32, message = "用户名长度需为 3~32 个字符")
    @Pattern(regexp = "^[A-Za-z0-9_\\-.]+$", message = "用户名只能包含字母、数字、下划线、中划线和点")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 64, message = "密码长度需为 6~64 个字符")
    private String password;

    /** 可选，不填则用用户名 */
    @Size(max = 32, message = "昵称最长 32 个字符")
    private String nickname;
}
