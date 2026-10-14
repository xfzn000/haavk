package com.haavk.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.haavk.common.BusinessException;
import com.haavk.common.PageResult;
import com.haavk.dto.PageQuery;
import com.haavk.dto.ProductDTO;
import com.haavk.entity.Product;
import com.haavk.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 商品服务
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductMapper productMapper;

    private String joinDetails(List<String> details) {
        return details == null ? "" : String.join("\n", details);
    }

    public PageResult<Product> page(PageQuery query) {
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(Product::getName, query.getKeyword());
        }
        if (StringUtils.hasText(query.getStatus())) {
            wrapper.eq(Product::getStatus, query.getStatus());
        }
        wrapper.orderByAsc(Product::getSort);
        Page<Product> page = productMapper.selectPage(new Page<>(query.getPage(), query.getPageSize()), wrapper);
        return PageResult.of(page.getRecords(), page.getTotal(), page.getCurrent(), page.getSize());
    }

    /** 前台：仅上架 */
    public List<Product> listOnSale() {
        return productMapper.selectList(new LambdaQueryWrapper<Product>()
                .eq(Product::getStatus, "ON_SALE")
                .orderByAsc(Product::getSort));
    }

    public Product detail(Long id) {
        Product p = productMapper.selectById(id);
        if (p == null) throw new BusinessException("商品不存在");
        return p;
    }

    public Product create(ProductDTO dto) {
        Product p = new Product();
        p.setName(dto.getName());
        p.setImage(dto.getImage());
        p.setDescription(dto.getDescription());
        p.setDetails(joinDetails(dto.getDetails()));
        p.setPrice(dto.getPrice());
        p.setPurchaseLimit(dto.getPurchaseLimit() == null ? 1 : dto.getPurchaseLimit());
        p.setSoldCount(dto.getSoldCount() == null ? 0 : dto.getSoldCount());
        p.setStatus(dto.getStatus() == null ? "OFF_SALE" : dto.getStatus());
        p.setSort(dto.getSort() == null ? 1 : dto.getSort());
        productMapper.insert(p);
        return p;
    }

    public Product update(Long id, ProductDTO dto) {
        Product p = detail(id);
        p.setName(dto.getName());
        p.setImage(dto.getImage());
        p.setDescription(dto.getDescription());
        p.setDetails(joinDetails(dto.getDetails()));
        p.setPrice(dto.getPrice());
        if (dto.getPurchaseLimit() != null) p.setPurchaseLimit(dto.getPurchaseLimit());
        if (dto.getSoldCount() != null) p.setSoldCount(dto.getSoldCount());
        if (dto.getStatus() != null) p.setStatus(dto.getStatus());
        if (dto.getSort() != null) p.setSort(dto.getSort());
        productMapper.updateById(p);
        return p;
    }

    public void delete(Long id) {
        productMapper.deleteById(id);
    }

    public void changeStatus(Long id, String status) {
        Product p = detail(id);
        p.setStatus(status);
        productMapper.updateById(p);
    }
}
