package com.faceattend_edu.attendance.domain.model;

import com.faceattend_edu.util.domain.model.LongBaseModel;
import com.faceattend_edu.util.enums.ApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Justification extends LongBaseModel {
    private Attendance attendance;
    private String text;
    private ApprovalStatus approval;
    // private Person reviewedBy;
    // private LocalDateTime reviewedAt;
}
