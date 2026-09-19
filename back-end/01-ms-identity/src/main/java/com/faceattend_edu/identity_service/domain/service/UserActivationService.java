package com.faceattend_edu.identity_service.domain.service;

import com.faceattend_edu.identity_service.domain.model.User;
import com.faceattend_edu.identity_service.domain.exception.DomainException;

public class UserActivationService {

    public void activateUser(User user) {
        if (user.getPersonId() == null) {
            throw new DomainException("Cannot activate user without associated person");
        }
        
        if (!user.getPersonId().isActive()) {
            throw new DomainException("Cannot activate user: associated person is inactive");
        }
        
        user.setStatus(true);
    }
}
