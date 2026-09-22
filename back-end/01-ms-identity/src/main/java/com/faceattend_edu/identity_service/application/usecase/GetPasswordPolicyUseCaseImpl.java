package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.GetPasswordPolicyUseCase;
import com.faceattend_edu.identity_service.application.port.out.LoadPasswordPolicyPort;
import com.faceattend_edu.identity_service.domain.model.PasswordPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetPasswordPolicyUseCaseImpl implements GetPasswordPolicyUseCase {

    private final LoadPasswordPolicyPort loadPasswordPolicyPort;

    @Override
    public PasswordPolicy getPolicy(Integer policyId) {
        return loadPasswordPolicyPort.loadPolicy(policyId);
    }
}
