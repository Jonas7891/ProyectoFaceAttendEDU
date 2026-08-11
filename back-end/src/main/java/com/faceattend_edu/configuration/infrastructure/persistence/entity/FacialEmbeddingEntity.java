package com.faceattend_edu.configuration.infrastructure.persistence.entity;

import com.faceattend_edu.security.infrastructure.persistence.entity.PersonEntity;
import com.faceattend_edu.util.infrastructure.entity.UUIDBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@Table(name = "facialEmbedding")
@NoArgsConstructor
@SuperBuilder
public class FacialEmbeddingEntity extends UUIDBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_person", nullable = false)
    private PersonEntity person;

    @Column(name = "embedding", nullable = false)
    private String embedding; // VECTOR

    @Column(name = "model_version", nullable = false)
    private String modelVersion;
}
