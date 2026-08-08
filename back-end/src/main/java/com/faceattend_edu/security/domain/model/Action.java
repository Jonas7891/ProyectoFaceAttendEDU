package com.faceattend_edu.security.domain.model;

import com.faceattend_edu.util.domain.model.IntegerBaseModel;

public class Action extends IntegerBaseModel {
    private String name;
    private String description;
    private String httpMethod;
}
