package com.faceattend_edu.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@EqualsAndHashCode
@Embeddable
public class ViewActionEntityId implements Serializable {
    private static final long serialVersionUID = -338441876860387349L;
    @Column(name = "id_view", nullable = false)
    private Integer idView;

    @Column(name = "id_action", nullable = false)
    private Integer idAction;


}