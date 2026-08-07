package com.faceattend_edu.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class View {
    private Integer id;
    private String name;
    private String route;
    private String title;
    private Boolean isPublic;

    private List<Action> actions;
}