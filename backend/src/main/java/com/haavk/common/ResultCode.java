package com.haavk.common;

import lombok.Getter;

/**
 * 业务返回码
 */
@Getter
public enum ResultCode {

    SUCCESS(0, "success"),
    PARAM_ERROR(400, "参数校验失败"),
    UNAUTHORIZED(401, "未登录或登录已过期"),
    FORBIDDEN(403, "无权访问"),
    NOT_FOUND(404, "资源不存在"),
    BUSINESS_ERROR(500, "业务处理失败"),
    SYSTEM_ERROR(999, "系统异常");

    private final int code;
    private final String message;

    ResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
