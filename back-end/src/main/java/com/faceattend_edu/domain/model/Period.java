package com.faceattend_edu.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Period {
    private Integer id;
    private School idSchool;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
}