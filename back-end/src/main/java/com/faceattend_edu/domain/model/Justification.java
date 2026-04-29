package com.faceattend_edu.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Justification {
    private Integer id;
    private Attendance attendance;
    private String justification;
    private Object approval;
    private Instant createdAt;
    private User reviewedBy;
    private Instant reviewedAt;
}