package com.haavk.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.haavk.common.Result;
import com.haavk.entity.ForumPost;
import com.haavk.entity.MissingPerson;
import com.haavk.entity.Product;
import com.haavk.mapper.EmployeeMapper;
import com.haavk.mapper.ForumPostMapper;
import com.haavk.mapper.MissingPersonMapper;
import com.haavk.mapper.ProductMapper;
import com.haavk.vo.DashboardVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 后台控制台统计
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ForumPostMapper postMapper;
    private final ProductMapper productMapper;
    private final MissingPersonMapper missingPersonMapper;
    private final EmployeeMapper employeeMapper;

    @GetMapping
    public Result<DashboardVO> stats() {
        DashboardVO vo = new DashboardVO();
        vo.setPostTotal(postMapper.selectCount(null));
        vo.setPostToday(postMapper.selectCount(new LambdaQueryWrapper<ForumPost>()
                .ge(ForumPost::getCreatedAt, LocalDateTime.of(LocalDate.now(), LocalTime.MIN))));
        vo.setProductTotal(productMapper.selectCount(null));
        vo.setProductOnSale(productMapper.selectCount(new LambdaQueryWrapper<Product>()
                .eq(Product::getStatus, "ON_SALE")));
        vo.setMissingPersonTotal(missingPersonMapper.selectCount(null));
        vo.setEmployeeTotal(employeeMapper.selectCount(null));
        return Result.success(vo);
    }
}
