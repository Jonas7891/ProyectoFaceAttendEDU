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
public class FacialEmbedding {
    private Integer id;
    private Person person;
    private List<Float> embedding;
    private String modelVersion;
    private Boolean isActive;
    private Instant createdAt;
}