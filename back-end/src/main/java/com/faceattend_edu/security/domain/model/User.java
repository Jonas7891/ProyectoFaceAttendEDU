package com.faceattend_edu.security.domain.model;

import com.faceattend_edu.util.domain.model.UUIDBaseModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User extends UUIDBaseModel {
    private Person person;
    private Role role;
    private String username;
    private String password;
}
