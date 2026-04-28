package com.faceattend_edu.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Person {
    private Integer id;
    private School school;
    private String name;
    private String lastName;
    private String email;
    private String phone;
    private Boolean isStudent;
    private Boolean isTeacher;
    private Boolean status;
    private Instant createdAt;
    private Instant updatedAt;
}