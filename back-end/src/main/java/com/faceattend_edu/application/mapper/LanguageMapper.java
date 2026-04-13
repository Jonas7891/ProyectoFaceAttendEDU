package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.LanguageRequest;
import com.faceattend_edu.domain.dto.response.LanguageResponse;
import com.faceattend_edu.domain.model.Language;
import org.springframework.stereotype.Component;

@Component
public class LanguageMapper {

    public Language toDomain(LanguageRequest request) {
        return new Language(
                null,
                request.languageName()
        );
    }

    public LanguageResponse toResponse(Language language) {
        return new LanguageResponse(
                language.getId(),
                language.getLanguageName()
        );
    }
}
