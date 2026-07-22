package com.faceattend_edu.newModule.domain.dto.patch;

public record SchoolPatch(
        String name,
        String nit,
        String address,
        String phone,
        String email
) {
}
