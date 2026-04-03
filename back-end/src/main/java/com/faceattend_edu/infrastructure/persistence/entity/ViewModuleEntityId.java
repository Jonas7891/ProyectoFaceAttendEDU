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
public class ViewModuleEntityId implements Serializable {
    private static final long serialVersionUID = -7017000256510600488L;
    @Column(name = "id_view", nullable = false)
    private Integer idView;

    @Column(name = "id_module", nullable = false)
    private Integer idModule;


}