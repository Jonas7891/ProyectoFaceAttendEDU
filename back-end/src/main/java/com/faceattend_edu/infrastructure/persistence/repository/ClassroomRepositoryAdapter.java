package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.Classroom;
import com.faceattend_edu.domain.port.ClassroomRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.ClassroomEntity;
import com.faceattend_edu.infrastructure.persistence.entity.SchoolEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class ClassroomRepositoryAdapter implements ClassroomRepositoryPort {

    private final ClassroomJpaRepository jpaRepository;
    private final SchoolRepositoryAdapter schoolRepositoryAdapter;

    @Override
    public Classroom save(Classroom classroom) {
        ClassroomEntity entity = toEntity(classroom);
        ClassroomEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Classroom> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Classroom> findAll() {
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

    private ClassroomEntity toEntity(Classroom classroom) {
        ClassroomEntity entity = new ClassroomEntity();
        entity.setId(classroom.getId());

        SchoolEntity school = new SchoolEntity();
        school.setId(classroom.getIdSchool().getId());
        entity.setIdSchool(school);

        entity.setClassroomName(classroom.getClassroomName());
        return entity;
    }

    public Classroom toDomain(ClassroomEntity entity) {
        return new Classroom(
                entity.getId(),
                schoolRepositoryAdapter.toDomain(entity.getIdSchool()),
                entity.getClassroomName()
        );
    }
}
