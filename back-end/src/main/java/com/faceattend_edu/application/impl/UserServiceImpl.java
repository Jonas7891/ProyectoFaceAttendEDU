package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.UserServiceMapper;
import com.faceattend_edu.application.service.UserService;
import com.faceattend_edu.domain.dto.request.UserRequest;
import com.faceattend_edu.domain.dto.response.UserResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.User;
import com.faceattend_edu.domain.port.UserRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private final UserRepositoryPort repository;
    private final UserServiceMapper mapper;

    @Override
    public UserResponse findById(Integer id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("User", id));
        return mapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public UserResponse save(UserRequest request) {
        User user = mapper.toDomain(request);
        User saved = repository.save(user);
        return mapper.toResponse(saved);
    }

    @Override
    public UserResponse update(Integer id, UserRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("User", id));
        User updated = mapper.toDomain(request);
        updated.setId(id);
        User saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("User", id);
        }
        repository.deleteById(id);
    }
}
