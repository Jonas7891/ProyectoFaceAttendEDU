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
public class Log {
    private Integer id;
    private User idUser;
    private String action;
    private String tableName;
    private String affectedRecord;
    private String description;
    private Instant date;
}