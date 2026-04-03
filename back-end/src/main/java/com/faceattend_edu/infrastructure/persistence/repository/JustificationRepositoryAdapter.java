package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.Justification;
import com.faceattend_edu.domain.port.JustificationRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.AttendanceEntity;
import com.faceattend_edu.infrastructure.persistence.entity.JustificationEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class JustificationRepositoryAdapter implements JustificationRepositoryPort {

    private final JustificationJpaRepository jpaRepository;
    private final AttendanceRepositoryAdapter attendanceRepositoryAdapter;
    private final UserRepositoryAdapter userRepositoryAdapter;

    @Override
    public Justification save(Justification justification) {
        JustificationEntity entity = toEntity(justification);
        JustificationEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Justification> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Justification> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

    //

    private JustificationEntity toEntity(Justification justification) {
        JustificationEntity entity = new JustificationEntity();
        entity.setId(justification.getId());

        AttendanceEntity attendance = new AttendanceEntity();
        attendance.setId(justification.getIdAttendance().getId());
        entity.setIdAttendance(attendance);

        entity.setJustification(justification.getJustification());
        entity.setApproval(justification.getApproval());
        entity.setCreatedAt(justification.getCreatedAt());

        UserEntity user = new UserEntity();
        user.setId(justification.getReviewedBy().getId());
        entity.setReviewedBy(user);

        entity.setReviewedAt(justification.getReviewedAt());
        return entity;
    }

    public Justification toDomain(JustificationEntity entity) {
        return new Justification(
                entity.getId(),
                attendanceRepositoryAdapter.toDomain(entity.getIdAttendance()),
                entity.getJustification(),
                entity.getApproval(),
                entity.getCreatedAt(),
                userRepositoryAdapter.toDomain(entity.getReviewedBy()),
                entity.getReviewedAt()
        );
    }
}
