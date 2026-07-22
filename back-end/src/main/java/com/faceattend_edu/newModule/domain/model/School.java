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
public class School extends UUIDBaseModel {
    private String name;
    private String nit;
    private String address;
    private String phone;
    private String email;
}
