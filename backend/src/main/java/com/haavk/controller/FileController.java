package com.haavk.controller;

import com.haavk.common.BusinessException;
import com.haavk.common.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.UUID;

/**
 * 文件上传（第一版本地 /uploads）
 */
@RestController
@RequestMapping("/api/upload")
public class FileController {

    @Value("${haavk.upload.dir:./uploads}")
    private String uploadDir;

    @PostMapping
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("上传文件为空");
        }
        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
        String datePath = LocalDate.now().toString().replace("-", "");
        String filename = UUID.randomUUID().toString().replace("-", "") + ext;

        try {
            Path dir = Paths.get(uploadDir, datePath);
            Files.createDirectories(dir);
            file.transferTo(dir.resolve(filename).toAbsolutePath().toFile());
        } catch (IOException e) {
            throw new BusinessException("文件保存失败：" + e.getMessage());
        }
        return Result.success("/uploads/" + datePath + "/" + filename);
    }
}
