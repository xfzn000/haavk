package com.haavk.controller;

import com.haavk.common.PageResult;
import com.haavk.common.Result;
import com.haavk.dto.MissingPersonDTO;
import com.haavk.dto.PageQuery;
import com.haavk.entity.MissingPerson;
import com.haavk.service.MissingPersonService;
import com.haavk.service.OperationLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 寻人启事接口
 */
@RestController
@RequestMapping("/api/missing-persons")
@RequiredArgsConstructor
public class MissingPersonController {

    private final MissingPersonService service;
    private final OperationLogService logService;

    @GetMapping
    public Result<PageResult<MissingPerson>> page(PageQuery query) {
        return Result.success(service.page(query));
    }

    /** 前台：仅上架 */
    @GetMapping("/on-sale")
    public Result<List<MissingPerson>> onSale() {
        return Result.success(service.listOnSale());
    }

    @GetMapping("/{id}")
    public Result<MissingPerson> detail(@PathVariable Long id) {
        return Result.success(service.detail(id));
    }

    @PostMapping
    public Result<MissingPerson> create(@Valid @RequestBody MissingPersonDTO dto,
                                        Authentication auth, HttpServletRequest req) {
        MissingPerson m = service.create(dto);
        logService.record(admin(auth), "新增", "寻人启事 " + m.getName(), ip(req));
        return Result.success(m);
    }

    @PutMapping("/{id}")
    public Result<MissingPerson> update(@PathVariable Long id, @Valid @RequestBody MissingPersonDTO dto,
                                        Authentication auth, HttpServletRequest req) {
        MissingPerson m = service.update(id, dto);
        logService.record(admin(auth), "编辑", "寻人启事 " + m.getName(), ip(req));
        return Result.success(m);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, Authentication auth, HttpServletRequest req) {
        MissingPerson m = service.detail(id);
        service.delete(id);
        logService.record(admin(auth), "删除", "寻人启事 " + m.getName(), ip(req));
        return Result.success();
    }

    @PatchMapping("/{id}/status")
    public Result<Void> changeStatus(@PathVariable Long id, @RequestParam String status,
                                     Authentication auth, HttpServletRequest req) {
        service.changeStatus(id, status);
        logService.record(admin(auth), "ON_SALE".equals(status) ? "上架" : "下架", "寻人启事 ID " + id, ip(req));
        return Result.success();
    }

    /** 前台「提交线索」：幂等，已提交再调仍是已提交 */
    @PatchMapping("/{id}/submit")
    public Result<MissingPerson> submit(@PathVariable Long id, Authentication auth, HttpServletRequest req) {
        MissingPerson m = service.submit(id);
        logService.record(admin(auth), "提交线索", "寻人启事 " + m.getName(), ip(req));
        return Result.success(m);
    }

    /** 后台：重置提交态，让前台按钮回到「提交线索」（便于反复演示 / 纠错） */
    @DeleteMapping("/{id}/submit")
    public Result<Void> resetSubmit(@PathVariable Long id, Authentication auth, HttpServletRequest req) {
        service.resetSubmit(id);
        logService.record(admin(auth), "重置线索提交态", "寻人启事 ID " + id, ip(req));
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
