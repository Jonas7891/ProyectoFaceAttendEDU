package com.faceattend_edu.newModule.infrastructure.persistence.entity;

import com.faceattend_edu.util.infrastructure.entity.LongBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "log")
@NoArgsConstructor
@SuperBuilder
public class LogEntity extends LongBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_user")
    private UserEntity user;

    @Column(name = "action", nullable = false)
    private String action;

    @Column(name = "table_name", nullable = false)
    private String tableName;

    @Column(name = "affected_record", nullable = false)
    private String affectedRecord;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;
}
