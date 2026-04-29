package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.infrastructure.persistence.entity.UserRoleEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserRoleEntityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRoleJpaRepository extends JpaRepository<UserRoleEntity, UserRoleEntityId> {
    /**
     * Obtener todos los roles de un usuario
     */
    List<UserRoleEntity> findByIdUser(Integer userId);

    /**
     * Obtener todos los usuarios con un rol específico
     */
    List<UserRoleEntity> findByIdRole(Integer roleId);

    /**
     * Buscar una relación específica usuario-rol
     */
    Optional<UserRoleEntity> findByIdUserAndIdRole(Integer userId, Integer roleId);

    /**
     * Obtener roles activos de un usuario (sin expirar)
     */
    @Query("SELECT ur FROM UserRoleEntity ur WHERE ur.id.user = :userId " +
            "AND (ur.expiryDate IS NULL OR ur.expiryDate > CURRENT_TIMESTAMP)")
    List<UserRoleEntity> findActiveRolesByUserId(@Param("userId") Integer userId);

    /**
     * Eliminar todos los roles de un usuario
     */
    void deleteByIdUser(Integer userId);

    /**
     * Verificar si un usuario tiene un rol específico
     */
    boolean existsByIdUserAndIdRole(Integer userId, Integer roleId);
}
