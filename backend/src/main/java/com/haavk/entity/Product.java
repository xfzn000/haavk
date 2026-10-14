package com.haavk.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品 product
 */
@Data
@TableName("product")
public class Product implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String image;

    private String description;

    /** 物品详情，多行以 \n 存储 */
    private String details;

    private BigDecimal price;

    /** 限购上限 */
    private Integer purchaseLimit;

    /** 已售数量 */
    private Integer soldCount;

    /** DRAFT / ON_SALE / OFF_SALE */
    private String status;

    private Integer sort;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
