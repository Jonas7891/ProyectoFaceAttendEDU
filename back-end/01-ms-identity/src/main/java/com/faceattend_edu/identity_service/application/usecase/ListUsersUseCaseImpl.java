package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.ListUsersUseCase;
import com.faceattend_edu.identity_service.application.port.out.ListUsersPort;
import com.faceattend_edu.identity_service.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ListUsersUseCaseImpl implements ListUsersUseCase {

    private final ListUsersPort listUsersPort;

    @Override
    public List<User> listUsers() {
        return listUsersPort.listUsers();
    }
}
