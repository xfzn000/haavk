package com.haavk.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.haavk.common.BusinessException;
import com.haavk.common.PageResult;
import com.haavk.dto.PageQuery;
import com.haavk.dto.PostDTO;
import com.haavk.entity.Employee;
import com.haavk.entity.ForumPost;
import com.haavk.entity.ForumReply;
import com.haavk.mapper.ForumPostMapper;
import com.haavk.mapper.ForumReplyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 帖子服务
 */
@Service
@RequiredArgsConstructor
public class ForumPostService {

    private final ForumPostMapper postMapper;
    private final ForumReplyMapper replyMapper;
    private final EmployeeService employeeService;

    /** 填充发帖人信息与最后回复信息 */
    private ForumPost enrich(ForumPost post) {
        if (post == null) return null;
        Employee author = employeeService.getById(post.getAuthorId());
        if (author != null) {
            post.setAuthorName(author.getName());
            // 头像：员工档案没有就回退个人中心（admin_user.avatar）
            post.setAuthorAvatar(employeeService.resolveAvatar(author));
            post.setDepartment(author.getDepartment());
            post.setTag(author.getRole());
        }
        // 最后回复：取该帖时间最新的一条回复
        ForumReply last = replyMapper.selectOne(new LambdaQueryWrapper<ForumReply>()
                .eq(ForumReply::getPostId, post.getId())
                .orderByDesc(ForumReply::getCreatedAt)
                .last("LIMIT 1"));
        if (last != null) {
            post.setLastReplyAt(last.getCreatedAt());
            Employee replyAuthor = employeeService.getById(last.getAuthorId());
            post.setLastReplyBy(replyAuthor != null ? replyAuthor.getName() : "");
        }
        return post;
    }

    public PageResult<ForumPost> page(PageQuery query) {
        LambdaQueryWrapper<ForumPost> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(ForumPost::getTitle, query.getKeyword());
        }
        if (StringUtils.hasText(query.getStatus())) {
            wrapper.eq(ForumPost::getStatus, query.getStatus());
        }
        wrapper.orderByDesc(ForumPost::getPinned).orderByDesc(ForumPost::getCreatedAt);
        Page<ForumPost> page = postMapper.selectPage(new Page<>(query.getPage(), query.getPageSize()), wrapper);
        page.getRecords().forEach(this::enrich);
        return PageResult.of(page.getRecords(), page.getTotal(), page.getCurrent(), page.getSize());
    }

    /** 前台列表：仅已发布，置顶优先 */
    public List<ForumPost> listPublished() {
        LambdaQueryWrapper<ForumPost> wrapper = new LambdaQueryWrapper<ForumPost>()
                .eq(ForumPost::getStatus, "ON_SALE")
                .orderByDesc(ForumPost::getPinned)
                .orderByDesc(ForumPost::getCreatedAt);
        List<ForumPost> list = postMapper.selectList(wrapper);
        list.forEach(this::enrich);
        return list;
    }

    public ForumPost detail(Long id) {
        ForumPost post = postMapper.selectById(id);
        if (post == null) throw new BusinessException("帖子不存在");
        return enrich(post);
    }

    public ForumPost create(PostDTO dto) {
        return create(dto, null);
    }

    /**
     * 新增帖子。
     *
     * @param username 登录用户名：前台发帖用它解析作者（与回复同一套逻辑），
     *                 避免帖子落成匿名（author_id = NULL → 详情页作者栏空白）；
     *                 后台可为 null，此时沿用 DTO 里显式传入的 authorId。
     *                 username 非空时**扣除发帖注意力点数**（每日重置）。
     */
    public ForumPost create(PostDTO dto, String username) {
        requireContentOrImages(dto);
        ForumPost post = new ForumPost();
        BeanUtils.copyProperties(dto, post);
        if (post.getStatus() == null) post.setStatus("ON_SALE");
        if (post.getPinned() == null) post.setPinned(false);
        post.setLikes(dto.getLikes() == null ? 0 : dto.getLikes());
        post.setReplyCount(0);
        if (post.getAuthorId() == null && StringUtils.hasText(username)) {
            Employee author = employeeService.findOrCreateForUser(username);
            // 发帖消耗注意力点数（不足会抛业务异常，帖子不会创建）
            employeeService.consumeAttentionPoints(author.getId(), EmployeeService.POST_COST);
            post.setAuthorId(author.getId());
        }
        postMapper.insert(post);
        return enrich(post);
    }

    public ForumPost update(Long id, PostDTO dto) {
        requireContentOrImages(dto);
        ForumPost exist = postMapper.selectById(id);
        if (exist == null) throw new BusinessException("帖子不存在");
        exist.setTitle(dto.getTitle());
        exist.setContent(dto.getContent());
        // images 传了才替换（传空数组表示清空配图）
        if (dto.getImages() != null) exist.setImages(dto.getImages());
        if (dto.getAuthorId() != null) exist.setAuthorId(dto.getAuthorId());
        if (dto.getPinned() != null) exist.setPinned(dto.getPinned());
        if (dto.getStatus() != null) exist.setStatus(dto.getStatus());
        postMapper.updateById(exist);
        return enrich(exist);
    }

    /** 正文与配图「至少要有一个」，否则帖子是空的 */
    private void requireContentOrImages(PostDTO dto) {
        boolean hasContent = StringUtils.hasText(dto.getContent());
        boolean hasImages = dto.getImages() != null && !dto.getImages().isEmpty();
        if (!hasContent && !hasImages) {
            throw new BusinessException("正文内容和图片不能同时为空");
        }
    }

    /** 软删除 */
    public void delete(Long id) {
        postMapper.deleteById(id);
    }

    public void pin(Long id, boolean pinned) {
        ForumPost post = postMapper.selectById(id);
        if (post == null) throw new BusinessException("帖子不存在");
        post.setPinned(pinned);
        postMapper.updateById(post);
    }

    public void increaseReplyCount(Long postId) {
        ForumPost post = postMapper.selectById(postId);
        if (post != null) {
            post.setReplyCount((post.getReplyCount() == null ? 0 : post.getReplyCount()) + 1);
            postMapper.updateById(post);
        }
    }

    public void decreaseReplyCount(Long postId) {
        ForumPost post = postMapper.selectById(postId);
        if (post != null && post.getReplyCount() != null && post.getReplyCount() > 0) {
            post.setReplyCount(post.getReplyCount() - 1);
            postMapper.updateById(post);
        }
    }
}
