package com.faceattend_edu.attendance_service.infrastructure.persistence.repository;

import com.faceattend_edu.attendance_service.infrastructure.persistence.entity.AttendanceRecordJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordJpaRepository extends JpaRepository<AttendanceRecordJpaEntity, Long> {
    Optional<AttendanceRecordJpaEntity> findByClassSessionIdAndAcademicActorId(Long classSessionId, Long academicActorId);
    List<AttendanceRecordJpaEntity> findByClassSessionId(Long classSessionId);

    /**
     * Conteo por actor y estado, agregado en SQL. Es lo que permite que una vista
     * calcule el porcentaje de asistencia de cientos de estudiantes sin descargar
     * los ~81k registros: la alternativa era traerlos todos y contarlos en el
     * cliente.
     */
    @Query("""
            select r.academicActorId as academicActorId,
                   r.attendanceStatus as attendanceStatus,
                   count(r) as total
              from AttendanceRecordJpaEntity r
             where r.academicActorId in :actorIds
               and r.deletedAt is null
             group by r.academicActorId, r.attendanceStatus
            """)
    List<ActorAttendanceCount> summarizeByActors(@Param("actorIds") Collection<Long> actorIds);
}
