package com.haavk.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 后台控制台统计
 */
@Data
public class DashboardVO implements Serializable {
    private long postTotal;
    private long postToday;
    private long productTotal;
    private long productOnSale;
    private long missingPersonTotal;
    private long employeeTotal;
}
