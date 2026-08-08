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
public class View extends IntegerBaseModel {
    private List<Action> actions;
    private String name;
    private String route;
    private String title;
    private boolean isPublic;
}
