package com.haavk.controller;

import com.haavk.common.PageResult;
import com.haavk.common.Result;
import com.haavk.dto.PageQuery;
import com.haavk.entity.OperationLog;
import com.haavk.service.OperationLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 操作日志接口
 */
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class OperationLogController {

    private final OperationLogService logService;

    @GetMapping
    public Result<PageResult<OperationLog>> page(PageQuery query) {
        return Result.success(logService.page(query));
    }
}
