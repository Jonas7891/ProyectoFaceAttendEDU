package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.infrastructure.persistence.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserJpaRepository extends JpaRepository<UserEntity, Integer> {

    boolean existsByUsername(String username);

    @Query("""
    select u from UserEntity u
    join fetch u.person p
    join fetch p.school
    where p.email = :email
""")
    Optional<UserEntity> findByPersonEmail(@Param("email") String email);
}
