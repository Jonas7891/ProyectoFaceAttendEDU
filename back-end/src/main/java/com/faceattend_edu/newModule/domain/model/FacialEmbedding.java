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
public class FacialEmbedding extends UUIDBaseModel {
    private Person person;
    private String embedding; // VECTOR
    private String modelVersion;
}
