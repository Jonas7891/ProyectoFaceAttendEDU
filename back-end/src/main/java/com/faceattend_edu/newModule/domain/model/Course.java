package com.faceattend_edu.newModule.domain.model;

import com.faceattend_edu.util.domain.model.IntegerBaseModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Course extends IntegerBaseModel {
    private School school;
    private String name;
    private String code;
}
