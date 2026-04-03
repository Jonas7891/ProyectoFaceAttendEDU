package com.faceattend_edu.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "view_action")
public class ViewActionEntity {
    @EmbeddedId
    private ViewActionEntityId id;

    @MapsId("idView")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_view", nullable = false)
    private ViewEntity idView;

    @MapsId("idAction")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_action", nullable = false)
    private ActionEntity idAction;


}