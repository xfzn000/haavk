package com.haavk.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginVO implements Serializable {
    private String token;
    private String username;
    private String nickname;
    /** 角色：ADMIN=管理员（能进后台）/ USER=普通用户（只能看前台）。取自 admin_user.role */
    private String role;
}
