package com.haavk.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 寻人启事新增 / 编辑
 */
@Data
public class MissingPersonDTO implements Serializable {

    private Long id;

    @NotBlank(message = "姓名不能为空")
    private String name;

    private String code;

    private String image;

    private String subtitle;

    private String description;

    private String rewardType;

    private String rewardText;

    private BigDecimal rewardAmount;

    /** 已提交线索（一般由前台 PATCH /{id}/submit 写入；后台编辑时可传 false 重置） */
    private Boolean submitted;

    private String status;

    private Integer sort;
}
