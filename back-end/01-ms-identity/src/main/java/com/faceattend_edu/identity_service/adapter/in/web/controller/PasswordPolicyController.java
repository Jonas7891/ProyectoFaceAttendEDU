package com.faceattend_edu.identity_service.adapter.in.web.controller;

import com.faceattend_edu.identity_service.adapter.in.web.dto.PasswordPolicyDto;
import com.faceattend_edu.identity_service.adapter.in.web.mapper.PasswordPolicyWebMapper;
import com.faceattend_edu.identity_service.application.port.in.CreatePasswordPolicyUseCase;
import com.faceattend_edu.identity_service.application.port.in.GetPasswordPolicyUseCase;
import com.faceattend_edu.identity_service.application.port.in.ListPasswordPoliciesUseCase;
import com.faceattend_edu.identity_service.application.port.in.UpdatePasswordPolicyUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/password-policies")
@RequiredArgsConstructor
public class PasswordPolicyController {

    private final CreatePasswordPolicyUseCase createPasswordPolicyUseCase;
    private final GetPasswordPolicyUseCase getPasswordPolicyUseCase;
    private final ListPasswordPoliciesUseCase listPasswordPoliciesUseCase;
    private final UpdatePasswordPolicyUseCase updatePasswordPolicyUseCase;
    private final PasswordPolicyWebMapper passwordPolicyWebMapper;

    @PostMapping
    public ResponseEntity<PasswordPolicyDto> createPolicy(@RequestBody PasswordPolicyDto policyDto) {
        return ResponseEntity.ok(passwordPolicyWebMapper.toDto(
                createPasswordPolicyUseCase.createPolicy(passwordPolicyWebMapper.toDomain(policyDto))));
    }

    @GetMapping
    public ResponseEntity<List<PasswordPolicyDto>> listPolicies() {
        return ResponseEntity.ok(listPasswordPoliciesUseCase.listPolicies().stream()
                .map(passwordPolicyWebMapper::toDto)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PasswordPolicyDto> getPolicy(@PathVariable Integer id) {
        return ResponseEntity.ok(passwordPolicyWebMapper.toDto(getPasswordPolicyUseCase.getPolicy(id)));
    }

    @PutMapping
    public ResponseEntity<Void> updatePolicy(@RequestBody PasswordPolicyDto policyDto) {
        updatePasswordPolicyUseCase.updatePolicy(passwordPolicyWebMapper.toDomain(policyDto));
        return ResponseEntity.noContent().build();
    }
}
