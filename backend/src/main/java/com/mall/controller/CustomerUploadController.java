package com.mall.controller;

import com.mall.common.Result;
import com.mall.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 客户侧图片上传：售后凭证使用（挑战 C.3）。
 */
@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        return Result.ok(fileStorageService.upload(file));
    }
}
