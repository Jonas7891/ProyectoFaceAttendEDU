package com.faceattend_edu.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Action {
    private Integer id;
    private String name;
    private String description;
    private String httpMethod;
    private Boolean enabled;
}