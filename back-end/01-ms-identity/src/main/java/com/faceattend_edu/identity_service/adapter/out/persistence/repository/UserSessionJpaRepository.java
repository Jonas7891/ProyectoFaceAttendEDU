package com.faceattend_edu.identity_service.adapter.out.persistence.repository;

import com.faceattend_edu.identity_service.adapter.out.persistence.entity.UserSessionJpaEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface UserSessionJpaRepository extends JpaRepository<UserSessionJpaEntity, UUID> {
    List<UserSessionJpaEntity> findByUser_UserId(UUID userId);

    /**
     * Cierre atómico de la rotación de refresh: una sola sentencia condicionada
     * a que la sesión siga Active. Devuelve el nº de filas afectadas, de modo
     * que solo un llamador puede emitir la sesión nueva (un solo uso).
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update UserSessionJpaEntity s
               set s.sessionStatus = :closedStatus,
                   s.endDate = :closedAt,
                   s.updatedAt = :closedAt
             where s.sessionId = :sessionId
               and s.sessionStatus = :activeStatus
            """)
    int closeIfActive(@Param("sessionId") UUID sessionId,
                      @Param("closedAt") LocalDateTime closedAt,
                      @Param("activeStatus") String activeStatus,
                      @Param("closedStatus") String closedStatus);

    /** Ids (resumen del token) de sesiones Active iniciadas antes del corte; el Pageable limita el lote. */
    @Query("""
            select s.sessionId from UserSessionJpaEntity s
             where s.sessionStatus = :activeStatus
               and s.endDate is null
               and s.startDate < :startedBefore
             order by s.startDate
            """)
    List<UUID> findActiveIdsStartedBefore(@Param("startedBefore") LocalDateTime startedBefore,
                                          @Param("activeStatus") String activeStatus,
                                          Pageable page);

    /** Cierre por lote en una sola sentencia; conserva la condición Active por si otro la cerró entre medias. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update UserSessionJpaEntity s
               set s.sessionStatus = :closedStatus,
                   s.endDate = :closedAt,
                   s.updatedAt = :closedAt
             where s.sessionId in :ids
               and s.sessionStatus = :activeStatus
            """)
    int closeActiveByIds(@Param("ids") List<UUID> ids,
                         @Param("closedAt") LocalDateTime closedAt,
                         @Param("activeStatus") String activeStatus,
                         @Param("closedStatus") String closedStatus);

    /** Closes every Active session of one user (account deleted); same shape as the batch close above. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update UserSessionJpaEntity s
               set s.sessionStatus = :closedStatus,
                   s.endDate = :closedAt,
                   s.updatedAt = :closedAt
             where s.user.userId = :userId
               and s.sessionStatus = :activeStatus
            """)
    int closeActiveByUser(@Param("userId") UUID userId,
                          @Param("closedAt") LocalDateTime closedAt,
                          @Param("activeStatus") String activeStatus,
                          @Param("closedStatus") String closedStatus);
}
