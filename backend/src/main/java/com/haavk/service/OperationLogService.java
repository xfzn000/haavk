package com.haavk.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.haavk.common.PageResult;
import com.haavk.dto.PageQuery;
import com.haavk.entity.OperationLog;
import com.haavk.mapper.OperationLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 操作日志服务
 */
@Service
@RequiredArgsConstructor
public class OperationLogService {

    private final OperationLogMapper logMapper;

    public void record(String admin, String action, String target, String ip) {
        OperationLog log = new OperationLog();
        log.setAdmin(admin);
        log.setAction(action);
        log.setTarget(target);
        log.setIp(ip);
        logMapper.insert(log);
    }

    public PageResult<OperationLog> page(PageQuery query) {
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(OperationLog::getAdmin, query.getKeyword())
                    .or().like(OperationLog::getAction, query.getKeyword())
                    .or().like(OperationLog::getTarget, query.getKeyword());
        }
        wrapper.orderByDesc(OperationLog::getCreatedAt);
        Page<OperationLog> page = logMapper.selectPage(new Page<>(query.getPage(), query.getPageSize()), wrapper);
        return PageResult.of(page.getRecords(), page.getTotal(), page.getCurrent(), page.getSize());
    }
}
