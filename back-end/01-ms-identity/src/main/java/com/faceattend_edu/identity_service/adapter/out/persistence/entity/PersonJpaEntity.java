package com.faceattend_edu.identity_service.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "persons")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PersonJpaEntity {
    @Id
    private UUID personId;
    
    @ManyToOne
    @JoinColumn(name = "school_id")
    private SchoolJpaEntity school;
    
    private String name;
    private String lastName;
    private String email;
    private String phone;
    private String rh; // Stored as String for DB simplicity
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
