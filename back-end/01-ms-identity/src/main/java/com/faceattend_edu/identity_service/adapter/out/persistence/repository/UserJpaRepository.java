package com.faceattend_edu.identity_service.adapter.out.persistence.repository;

import com.faceattend_edu.identity_service.adapter.out.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserJpaRepository extends JpaRepository<UserJpaEntity, UUID> {
    Optional<UserJpaEntity> findByUsername(String username);

    /**
     * Email lookup used by login. Soft-deleted users and persons are excluded so the result
     * always agrees with the partial unique index uq_person_email (WHERE deleted_at IS NULL).
     */
    @Query("""
            select u from UserJpaEntity u
                join u.person p
                where lower(p.email) = lower(:email)
                  and u.deletedAt is null
                  and p.deletedAt is null
            """)
    List<UserJpaEntity> findByPersonEmail(@Param("email") String email);
}
