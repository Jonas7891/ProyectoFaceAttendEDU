package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.Enrollment;
import com.faceattend_edu.domain.port.EnrollmentRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.CourseEntity;
import com.faceattend_edu.infrastructure.persistence.entity.EnrollmentEntity;
import com.faceattend_edu.infrastructure.persistence.entity.PeriodEntity;
import com.faceattend_edu.infrastructure.persistence.entity.PersonEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class EnrollmentRepositoryAdapter implements EnrollmentRepositoryPort {

    private final EnrollmentJpaRepository jpaRepository;

    private final PersonRepositoryAdapter studentRepositoryAdapter;
    private final CourseRepositoryAdapter courseRepositoryAdapter;
    private final PeriodRepositoryAdapter periodRepositoryAdapter;

    @Override
    public Enrollment save(Enrollment enrollment) {
        EnrollmentEntity entity = toEntity(enrollment);
        EnrollmentEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Enrollment> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Enrollment> findAll() {
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

    private EnrollmentEntity toEntity(Enrollment enrollment) {
        EnrollmentEntity entity = new EnrollmentEntity();
        entity.setId(enrollment.getId());

        PersonEntity student = new PersonEntity();
        student.setId(enrollment.getIdStudent().getId());
        entity.setIdStudent(student);

        CourseEntity course = new CourseEntity();
        course.setId(enrollment.getIdCourse().getId());
        entity.setIdCourse(course);

        PeriodEntity period = new PeriodEntity();
        period.setId(enrollment.getIdPeriod().getId());
        entity.setIdPeriod(period);

        entity.setEnrollmentDate(enrollment.getEnrollmentDate());
        entity.setStatus(enrollment.getStatus());
        return entity;
    }

    public Enrollment toDomain(EnrollmentEntity entity) {
        return new Enrollment(
                entity.getId(),
                studentRepositoryAdapter.toDomain(entity.getIdStudent()),
                courseRepositoryAdapter.toDomain(entity.getIdCourse()),
                periodRepositoryAdapter.toDomain(entity.getIdPeriod()),
                entity.getEnrollmentDate(),
                entity.getStatus()
        );
    }
}
