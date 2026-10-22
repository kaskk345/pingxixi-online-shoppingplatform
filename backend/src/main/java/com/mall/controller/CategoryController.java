package com.mall.controller;

import com.mall.common.Result;
import com.mall.entity.Category;
import com.mall.service.CategoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 两级商品分类接口。
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /** 分类树（一级 + 子级） */
    @GetMapping("/categories")
    public Result<List<Map<String, Object>>> tree() {
        return Result.ok(categoryService.tree());
    }

    @GetMapping("/categories/top")
    public Result<List<Category>> top() {
        return Result.ok(categoryService.topLevel());
    }

    @GetMapping("/categories/{parentId}/children")
    public Result<List<Category>> children(@PathVariable Long parentId) {
        return Result.ok(categoryService.children(parentId));
    }

    @PostMapping("/seller/categories")
    public Result<Category> create(@Valid @RequestBody CategoryReq req) {
        return Result.ok(categoryService.create(req.name(), req.parentId(), req.sort()));
    }

    @DeleteMapping("/seller/categories/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.ok();
    }

    public record CategoryReq(
            @NotBlank(message = "分类名称不能为空") String name,
            Long parentId,
            Integer sort
    ) {
    }
}
