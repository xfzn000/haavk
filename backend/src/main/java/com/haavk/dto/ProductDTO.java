package com.haavk.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

/**
 * 商品新增 / 编辑
 */
@Data
public class ProductDTO implements Serializable {

    private Long id;

    @NotBlank(message = "商品名称不能为空")
    private String name;

    private String image;

    private String description;

    /** 物品详情，每行一条 */
    private List<String> details;

    private BigDecimal price;

    private Integer purchaseLimit;

    private Integer soldCount;

    private String status;

    private Integer sort;
}
