package com.haavk.controller;

import com.haavk.common.PageResult;
import com.haavk.common.Result;
import com.haavk.dto.PageQuery;
import com.haavk.dto.ProductDTO;
import com.haavk.entity.Product;
import com.haavk.service.OperationLogService;
import com.haavk.service.ProductService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 商品接口
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final OperationLogService logService;

    @GetMapping
    public Result<PageResult<Product>> page(PageQuery query) {
        return Result.success(productService.page(query));
    }

    /** 前台：仅上架 */
    @GetMapping("/on-sale")
    public Result<List<Product>> onSale() {
        return Result.success(productService.listOnSale());
    }

    @GetMapping("/{id}")
    public Result<Product> detail(@PathVariable Long id) {
        return Result.success(productService.detail(id));
    }

    @PostMapping
    public Result<Product> create(@Valid @RequestBody ProductDTO dto, Authentication auth, HttpServletRequest req) {
        Product p = productService.create(dto);
        logService.record(admin(auth), "新增", "商品《" + p.getName() + "》", ip(req));
        return Result.success(p);
    }

    @PutMapping("/{id}")
    public Result<Product> update(@PathVariable Long id, @Valid @RequestBody ProductDTO dto,
                                  Authentication auth, HttpServletRequest req) {
        Product p = productService.update(id, dto);
        logService.record(admin(auth), "编辑", "商品《" + p.getName() + "》", ip(req));
        return Result.success(p);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, Authentication auth, HttpServletRequest req) {
        Product p = productService.detail(id);
        productService.delete(id);
        logService.record(admin(auth), "删除", "商品《" + p.getName() + "》", ip(req));
        return Result.success();
    }

    @PatchMapping("/{id}/status")
    public Result<Void> changeStatus(@PathVariable Long id, @RequestParam String status,
                                     Authentication auth, HttpServletRequest req) {
        productService.changeStatus(id, status);
        logService.record(admin(auth), "ON_SALE".equals(status) ? "上架" : "下架", "商品 ID " + id, ip(req));
        return Result.success();
    }

    private String admin(Authentication auth) {
        return auth != null ? auth.getName() : "anonymous";
    }

    private String ip(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = request.getRemoteAddr();
        return ip.contains(",") ? ip.split(",")[0].trim() : ip;
    }
}
