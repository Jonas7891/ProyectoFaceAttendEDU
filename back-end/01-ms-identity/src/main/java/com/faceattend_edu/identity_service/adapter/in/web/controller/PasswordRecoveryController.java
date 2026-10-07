package com.faceattend_edu.identity_service.adapter.in.web.controller;

import com.faceattend_edu.identity_service.adapter.in.web.dto.AuthStatusDto;
import com.faceattend_edu.identity_service.adapter.in.web.dto.ForgotPasswordRequest;
import com.faceattend_edu.identity_service.adapter.in.web.dto.ResetPasswordRequest;
import com.faceattend_edu.identity_service.adapter.in.web.dto.VerifyCodeRequest;
import com.faceattend_edu.identity_service.application.port.in.RequestPasswordRecoveryUseCase;
import com.faceattend_edu.identity_service.application.port.in.ResetPasswordUseCase;
import com.faceattend_edu.identity_service.application.port.in.VerifyRecoveryCodeUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Recuperación de contraseña en tres pasos (rutas ya consumidas por el front
 * Web y Mobile: endpoints.identity.forgotPassword / verifyCode / resetPassword).
 *
 * <ol>
 *   <li>POST /forgot-password → genera el código y notifica a notification;</li>
 *   <li>POST /verify-code → valida el código y deja el reto verificado;</li>
 *   <li>POST /reset-password → aplica la contraseña nueva.</li>
 * </ol>
 *
 * <p>Los tres son públicos (como login/logout): no hay sesión todavía. La
 * autorización la da el reto verificado que vive en el almacén en memoria.</p>
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class PasswordRecoveryController {

    private final RequestPasswordRecoveryUseCase requestPasswordRecoveryUseCase;
    private final VerifyRecoveryCodeUseCase verifyRecoveryCodeUseCase;
    private final ResetPasswordUseCase resetPasswordUseCase;

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthStatusDto> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        requestPasswordRecoveryUseCase.requestCode(request.getEmail());
        // 202 siempre, exista o no la cuenta (anti-enumeración).
        return ResponseEntity.accepted().body(AuthStatusDto.accepted());
    }

    @PostMapping("/verify-code")
    public ResponseEntity<AuthStatusDto> verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        verifyRecoveryCodeUseCase.verify(request.getEmail(), request.getCode());
        return ResponseEntity.ok(AuthStatusDto.verified());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthStatusDto> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        resetPasswordUseCase.resetPassword(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(AuthStatusDto.updated());
    }
}
