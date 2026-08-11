package com.faceattend_edu.security.domain.model;

import com.faceattend_edu.util.domain.model.IntegerBaseModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Module extends IntegerBaseModel {
    private List<View> views;
    private String name;
    private String description;
    private String icon;
    private Integer order;
}
