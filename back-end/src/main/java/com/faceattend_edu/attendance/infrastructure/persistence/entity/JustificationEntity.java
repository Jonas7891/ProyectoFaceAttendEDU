package com.faceattend_edu.attendance.infrastructure.persistence.entity;

import com.faceattend_edu.util.enums.ApprovalStatus;
import com.faceattend_edu.util.infrastructure.entity.LongBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@Table(name = "justification")
@NoArgsConstructor
@SuperBuilder
public class JustificationEntity extends LongBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_attendance", nullable = false)
    private AttendanceEntity attendance;

    @Column(name = "text", nullable = false)
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval", nullable = false)
    private ApprovalStatus approval;

    // private PersonEntity reviewedBy;

    // private LocalDateTime reviewedAt;
}
