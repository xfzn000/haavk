package com.haavk.common;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 分页返回结构
 * data: { records: [], total, page, pageSize }
 */
@Data
public class PageResult<T> implements Serializable {

    private List<T> records;
    private long total;
    private long page;
    private long pageSize;

    public PageResult() {
    }

    public PageResult(List<T> records, long total, long page, long pageSize) {
        this.records = records;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
    }

    public static <T> PageResult<T> of(List<T> records, long total, long page, long pageSize) {
        return new PageResult<>(records, total, page, pageSize);
    }
}
