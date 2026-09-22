package com.faceattend_edu.identity_service.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "city", schema = "identity")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CityJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cityId;

    private String name;
    private String department;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
