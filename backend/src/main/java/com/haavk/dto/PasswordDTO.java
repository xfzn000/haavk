package com.haavk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

/**
 * 修改密码（需要校验原密码）
 */
@Data
public class PasswordDTO implements Serializable {

    @NotBlank(message = "请输入当前密码")
    private String oldPassword;

    @NotBlank(message = "请输入新密码")
    @Size(min = 6, max = 64, message = "新密码长度需为 6~64 个字符")
    private String newPassword;
}
