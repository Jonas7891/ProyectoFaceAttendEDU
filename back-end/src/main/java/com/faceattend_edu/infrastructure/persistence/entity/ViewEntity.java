package com.faceattend_edu.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@Entity
@Table(name = "view")
public class ViewEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_view", nullable = false)
    private Integer id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "route", nullable = false, length = 500)
    private String route;

    @Column(name = "title", nullable = false)
    private String title;

    @ColumnDefault("false")
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic;


}