package com.haavk.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.haavk.common.BusinessException;
import com.haavk.common.PageResult;
import com.haavk.dto.MissingPersonDTO;
import com.haavk.dto.PageQuery;
import com.haavk.entity.MissingPerson;
import com.haavk.mapper.MissingPersonMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 寻人启事服务
 */
@Service
@RequiredArgsConstructor
public class MissingPersonService {

    private final MissingPersonMapper missingPersonMapper;

    public PageResult<MissingPerson> page(PageQuery query) {
        LambdaQueryWrapper<MissingPerson> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(MissingPerson::getName, query.getKeyword())
                    .or().like(MissingPerson::getCode, query.getKeyword());
        }
        if (StringUtils.hasText(query.getStatus())) {
            wrapper.eq(MissingPerson::getStatus, query.getStatus());
        }
        wrapper.orderByAsc(MissingPerson::getSort);
        Page<MissingPerson> page = missingPersonMapper.selectPage(
                new Page<>(query.getPage(), query.getPageSize()), wrapper);
        return PageResult.of(page.getRecords(), page.getTotal(), page.getCurrent(), page.getSize());
    }

    /** 前台：仅上架 */
    public List<MissingPerson> listOnSale() {
        return missingPersonMapper.selectList(new LambdaQueryWrapper<MissingPerson>()
                .eq(MissingPerson::getStatus, "ON_SALE")
                .orderByAsc(MissingPerson::getSort));
    }

    public MissingPerson detail(Long id) {
        MissingPerson m = missingPersonMapper.selectById(id);
        if (m == null) throw new BusinessException("寻人启事不存在");
        return m;
    }

    /**
     * 新增：新人物默认排在最后（sort = 当前最大值 + 1），默认下架，避免误上架；
     * 也避免多条都拿到同一个 sort 导致顺序错乱。
     */
    public MissingPerson create(MissingPersonDTO dto) {
        MissingPerson m = new MissingPerson();
        BeanUtils.copyProperties(dto, m);
        if (m.getStatus() == null) m.setStatus("OFF_SALE");
        if (m.getSort() == null) m.setSort(nextSort());
        if (m.getSubmitted() == null) m.setSubmitted(false);
        if (m.getRewardAmount() == null) m.setRewardAmount(java.math.BigDecimal.ZERO);
        missingPersonMapper.insert(m);
        return m;
    }

    public MissingPerson update(Long id, MissingPersonDTO dto) {
        MissingPerson m = detail(id);
        Boolean submitted = m.getSubmitted();
        BeanUtils.copyProperties(dto, m);
        // DTO 里没传 submitted 时不要把已有提交态覆盖掉
        if (dto.getSubmitted() == null) m.setSubmitted(submitted);
        m.setId(id);
        missingPersonMapper.updateById(m);
        return m;
    }

    /** 前台「提交线索」：把该启事标为已提交（幂等，已提交直接返回） */
    public MissingPerson submit(Long id) {
        MissingPerson m = detail(id);
        if (Boolean.TRUE.equals(m.getSubmitted())) return m;
        m.setSubmitted(true);
        missingPersonMapper.updateById(m);
        return m;
    }

    /** 后台：重置提交态，让前台按钮回到「提交线索」 */
    public void resetSubmit(Long id) {
        MissingPerson m = detail(id);
        m.setSubmitted(false);
        missingPersonMapper.updateById(m);
    }

    /** 新的排序号 = 当前最大 sort + 1 */
    private Integer nextSort() {
        MissingPerson last = missingPersonMapper.selectOne(new LambdaQueryWrapper<MissingPerson>()
                .orderByDesc(MissingPerson::getSort)
                .last("limit 1"));
        return last == null || last.getSort() == null ? 1 : last.getSort() + 1;
    }

    public void delete(Long id) {
        missingPersonMapper.deleteById(id);
    }

    public void changeStatus(Long id, String status) {
        MissingPerson m = detail(id);
        m.setStatus(status);
        missingPersonMapper.updateById(m);
    }
}
