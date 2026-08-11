package com.faceattend_edu.academic.domain.model;

import com.faceattend_edu.security.domain.model.School;
import com.faceattend_edu.util.domain.model.IntegerBaseModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Period extends IntegerBaseModel {
    private School school;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
}
