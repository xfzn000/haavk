package com.haavk.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.haavk.common.BusinessException;
import com.haavk.dto.ReplyDTO;
import com.haavk.entity.Employee;
import com.haavk.entity.ForumReply;
import com.haavk.mapper.ForumReplyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 回复服务
 */
@Service
@RequiredArgsConstructor
public class ForumReplyService {

    private final ForumReplyMapper replyMapper;
    private final EmployeeService employeeService;
    private final ForumPostService postService;

    private ForumReply enrich(ForumReply reply) {
        if (reply == null) return null;
        Employee author = employeeService.getById(reply.getAuthorId());
        if (author != null) {
            reply.setAuthorName(author.getName());
            // 头像：员工档案没有就回退个人中心（admin_user.avatar）
            reply.setAuthorAvatar(employeeService.resolveAvatar(author));
            reply.setDepartment(author.getDepartment());
            reply.setTag(author.getRole());
        }
        return reply;
    }

    /** 按帖子查询回复（时间正序） */
    public List<ForumReply> listByPost(Long postId) {
        List<ForumReply> list = replyMapper.selectList(new LambdaQueryWrapper<ForumReply>()
                .eq(ForumReply::getPostId, postId)
                .orderByAsc(ForumReply::getCreatedAt));
        list.forEach(this::enrich);
        return list;
    }

    /**
     * 提交回复
     * 作者一律由后端根据当前登录账号确定，不信任前端传入的身份。
     */
    public ForumReply create(Long postId, ReplyDTO dto, String username) {
        // 校验帖子存在
        postService.detail(postId);

        String content = dto.getContent() == null ? "" : dto.getContent().trim();
        List<String> images = dto.getImages() == null ? List.of() : dto.getImages();
        // 允许只发图不写字，但两者不能同时为空
        if (content.isEmpty() && images.isEmpty()) {
            throw new BusinessException("回复内容和图片不能同时为空");
        }

        // 根据登录账号找到（或创建）员工档案
        Employee author = employeeService.findOrCreateForUser(username);
        // 扣除注意力点数（先做每日重置；不足会抛业务异常）
        employeeService.consumeAttentionPoints(author.getId(), EmployeeService.REPLY_COST);

        ForumReply reply = new ForumReply();
        reply.setPostId(postId);
        reply.setAuthorId(author.getId());
        reply.setContent(content);
        reply.setImages(images);
        reply.setStatus("ON_SALE");
        replyMapper.insert(reply);
        postService.increaseReplyCount(postId);
        return enrich(reply);
    }

    public void delete(Long id) {
        ForumReply reply = replyMapper.selectById(id);
        if (reply == null) throw new BusinessException("回复不存在");
        replyMapper.deleteById(id);
        postService.decreaseReplyCount(reply.getPostId());
    }
}
