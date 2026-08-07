package com.faceattend_edu.newModule.domain.model;

import com.faceattend_edu.util.domain.model.UUIDBaseModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Person extends UUIDBaseModel {
    private School school;
    private String name;
    private String lastName;
    private String email;
    private String phone;
    private boolean isStudent;
    private boolean isTeacher;
}
