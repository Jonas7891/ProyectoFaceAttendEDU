package com.faceattend_edu.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "view_module")
public class ViewModuleEntity {
    @EmbeddedId
    private ViewModuleEntityId id;

    @MapsId("idView")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_view", nullable = false)
    private ViewEntity idView;

    @MapsId("idModule")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_module", nullable = false)
    private ModuleEntity idModule;


}