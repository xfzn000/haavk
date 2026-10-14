package com.haavk.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 寻人启事 missing_person
 */
@Data
@TableName("missing_person")
public class MissingPerson implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    /** 编号，如 H42 */
    private String code;

    private String image;

    /** 副标题标签，空格分隔 */
    private String subtitle;

    private String description;

    /** 奖励类型：悬赏哈夫币总额 / 举报奖励 */
    private String rewardType;

    private String rewardText;

    private BigDecimal rewardAmount;

    /** DRAFT / ON_SALE / OFF_SALE */
    private String status;

    private Integer sort;

    /** 线索是否已提交（前台按钮态；后台可重置，让按钮回到「提交线索」） */
    private Boolean submitted;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
