package com.mall.service;

import com.mall.common.BizException;
import com.mall.entity.Category;
import com.mall.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 两级商品分类管理。
 */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> topLevel() {
        return categoryRepository.findByParentIdIsNullOrderBySortAsc();
    }

    public List<Category> children(Long parentId) {
        return categoryRepository.findByParentIdOrderBySortAsc(parentId);
    }

    public List<Category> all() {
        return categoryRepository.findAll();
    }

    /** 两级分类树 */
    public List<Map<String, Object>> tree() {
        return topLevel().stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", t.getId());
            m.put("name", t.getName());
            m.put("children", children(t.getId()));
            return m;
        }).toList();
    }

    @Transactional
    public Category create(String name, Long parentId, Integer sort) {
        if (name == null || name.isBlank()) {
            throw new BizException("分类名称不能为空");
        }
        if (categoryRepository.existsByNameAndParentId(name.trim(), parentId)) {
            throw new BizException("同级分类已存在");
        }
        if (parentId != null) {
            Category parent = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new BizException("父分类不存在"));
            if (parent.getParentId() != null) {
                throw new BizException("仅支持两级分类");
            }
        }
        return categoryRepository.save(Category.builder()
                .name(name.trim()).parentId(parentId).sort(sort == null ? 0 : sort).build());
    }

    @Transactional
    public void delete(Long id) {
        if (!categoryRepository.findByParentIdOrderBySortAsc(id).isEmpty()) {
            throw new BizException("请先删除该分类下的子分类");
        }
        categoryRepository.deleteById(id);
    }
}
