package com.haavk.controller;

import com.haavk.common.PageResult;
import com.haavk.common.Result;
import com.haavk.dto.PageQuery;
import com.haavk.entity.Employee;
import com.haavk.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 员工接口（第一版只读）
 */
@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public Result<List<Employee>> list() {
        return Result.success(employeeService.list());
    }

    @GetMapping("/page")
    public Result<PageResult<Employee>> page(PageQuery query) {
        return Result.success(employeeService.page(query));
    }

    @GetMapping("/{id}")
    public Result<Employee> detail(@PathVariable Long id) {
        return Result.success(employeeService.getById(id));
    }
}
