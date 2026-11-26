package com.mall.service;

import com.mall.common.BizException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * 本地文件存储：商品图片与售后凭证图片共用。
 * 文件落在 mall.upload-dir，对外通过 /uploads/** 静态映射访问。
 */
@Service
public class FileStorageService {

    @Value("${mall.upload-dir:uploads}")
    private String uploadDir;

    public String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BizException("请选择文件");
        }
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        if (!ext.isEmpty() && !ext.toLowerCase().matches("\\.(png|jpg|jpeg|gif|webp|bmp)")) {
            throw new BizException("仅支持 png / jpg / jpeg / gif / webp / bmp 图片");
        }
        String filename = UUID.randomUUID().toString().replace("-", "") + ext;
        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath();
            Files.createDirectories(dir);
            file.transferTo(dir.resolve(filename).toFile());
        } catch (IOException e) {
            throw new BizException("文件上传失败");
        }
        return "/uploads/" + filename;
    }
}
