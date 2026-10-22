package com.mall.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 商品分类，支持两级：parentId 为 null 表示一级分类。
 */
@Entity
@Table(name = "category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    /** 父分类 ID，null 表示一级分类 */
    private Long parentId;

    @Column(nullable = false)
    @Builder.Default
    private Integer sort = 0;
}
