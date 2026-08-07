package com.faceattend_edu.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Integer id;
    private Person person;
    private String username;
    private String password;
    private Boolean status;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastLogin;

    private List<UserRole> roles;
}