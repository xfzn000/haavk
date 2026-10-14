package com.haavk.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * 通用分页查询参数
 */
@Data
public class PageQuery implements Serializable {

    private Long page = 1L;

    private Long pageSize = 20L;

    private String keyword;

    private String status;
}
