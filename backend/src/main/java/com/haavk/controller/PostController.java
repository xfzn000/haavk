package com.haavk.controller;

import com.haavk.common.PageResult;
import com.haavk.common.Result;
import com.haavk.dto.PageQuery;
import com.haavk.dto.PostDTO;
import com.haavk.dto.ReplyDTO;
import com.haavk.entity.ForumPost;
import com.haavk.entity.ForumReply;
import com.haavk.service.ForumPostService;
import com.haavk.service.ForumReplyService;
import com.haavk.service.OperationLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 帖子 / 回复接口
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PostController {

    private final ForumPostService postService;
    private final ForumReplyService replyService;
    private final OperationLogService logService;

    /* -------------------- 帖子 -------------------- */

    @GetMapping("/posts")
    public Result<PageResult<ForumPost>> page(PageQuery query) {
        return Result.success(postService.page(query));
    }

    /** 前台列表：仅已发布 */
    @GetMapping("/posts/published")
    public Result<List<ForumPost>> published() {
        return Result.success(postService.listPublished());
    }

    @GetMapping("/posts/{id}")
    public Result<ForumPost> detail(@PathVariable Long id) {
        return Result.success(postService.detail(id));
    }

    @PostMapping("/posts")
    public Result<ForumPost> create(@Valid @RequestBody PostDTO dto, Authentication auth, HttpServletRequest req) {
        // 作者由后端从登录态解析（前台发帖），与回复口径一致；后台仍可显式传 authorId
        String username = auth != null ? auth.getName() : null;
        ForumPost post = postService.create(dto, username);
        logService.record(admin(auth), "新增", "帖子《" + post.getTitle() + "》", ip(req));
        return Result.success(post);
    }

    @PutMapping("/posts/{id}")
    public Result<ForumPost> update(@PathVariable Long id, @Valid @RequestBody PostDTO dto,
                                    Authentication auth, HttpServletRequest req) {
        ForumPost post = postService.update(id, dto);
        logService.record(admin(auth), "编辑", "帖子《" + post.getTitle() + "》", ip(req));
        return Result.success(post);
    }

    @DeleteMapping("/posts/{id}")
    public Result<Void> delete(@PathVariable Long id, Authentication auth, HttpServletRequest req) {
        ForumPost post = postService.detail(id);
        postService.delete(id);
        logService.record(admin(auth), "删除", "帖子《" + post.getTitle() + "》", ip(req));
        return Result.success();
    }

    @PatchMapping("/posts/{id}/pin")
    public Result<Void> pin(@PathVariable Long id, @RequestParam boolean pinned,
                            Authentication auth, HttpServletRequest req) {
        postService.pin(id, pinned);
        logService.record(admin(auth), pinned ? "置顶" : "取消置顶", "帖子 ID " + id, ip(req));
        return Result.success();
    }

    /* -------------------- 回复 -------------------- */

    @GetMapping("/posts/{postId}/replies")
    public Result<List<ForumReply>> replies(@PathVariable Long postId) {
        return Result.success(replyService.listByPost(postId));
    }

    @PostMapping("/posts/{postId}/replies")
    public Result<ForumReply> createReply(@PathVariable Long postId, @Valid @RequestBody ReplyDTO dto,
                                          Authentication auth) {
        // 作者由后端从登录态解析，忽略前端传入的身份
        String username = auth != null ? auth.getName() : null;
        return Result.success(replyService.create(postId, dto, username));
    }

    @DeleteMapping("/replies/{id}")
    public Result<Void> deleteReply(@PathVariable Long id, Authentication auth, HttpServletRequest req) {
        replyService.delete(id);
        logService.record(admin(auth), "删除", "帖子回复 ID " + id, ip(req));
        return Result.success();
    }

    /* -------------------- 工具 -------------------- */

    private String admin(Authentication auth) {
        return auth != null ? auth.getName() : "anonymous";
    }

    private String ip(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = request.getRemoteAddr();
        return ip.contains(",") ? ip.split(",")[0].trim() : ip;
    }
}
