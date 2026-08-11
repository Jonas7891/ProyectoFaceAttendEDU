package com.faceattend_edu.audit.domain.model;

import com.faceattend_edu.security.domain.model.User;
import com.faceattend_edu.util.domain.model.LongBaseModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Log extends LongBaseModel {
    private User user;
    private String action;
    private String tableName;
    private String affectedRecord;
    private String description;
    private LocalDateTime date;
}
