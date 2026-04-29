package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.UserRoleRequest;
import com.faceattend_edu.domain.dto.response.UserRoleResponse;

import java.time.Instant;
import java.util.List;

public interface UserRoleService {

    // Obtener una relación usuario-rol específica
    UserRoleResponse findByIdUserAndIdRole(Integer userId, Integer roleId);

    //Obtener todos los roles de un usuario
    List<UserRoleResponse> findByIdUser(Integer userId);

    //Obtener todos los usuarios con un rol específico
    List<UserRoleResponse> findByIdRole(Integer roleId);

    //Obtener todos los roles activos (no expirados) de un usuario
    List<UserRoleResponse> findActiveRolesByUserId(Integer userId);

    //Obtener todas las relaciones usuario-rol
    List<UserRoleResponse> findAll();

    //Asignar un rol a un usuario
    UserRoleResponse save(UserRoleRequest request);

    //Actualizar fecha de expiración de un rol de un usuario
    UserRoleResponse updateExpiryDate(Integer userId, Integer roleId, Instant expiryDate);

    //Revocar un rol a un usuario
    void deleteByIdUserAndIdRole(Integer userId, Integer roleId);

    //Revocar todos los roles de un usuario
    void deleteByIdUser(Integer userId);

    //Verificar si un usuario tiene un rol específico
    boolean userHasRole(Integer userId, Integer roleId);
}