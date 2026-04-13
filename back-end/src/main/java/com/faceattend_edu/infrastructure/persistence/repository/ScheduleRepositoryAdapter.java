package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.Schedule;
import com.faceattend_edu.domain.port.ScheduleRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class ScheduleRepositoryAdapter implements ScheduleRepositoryPort {

    private final ScheduleJpaRepository jpaRepository;
    private final PeriodRepositoryAdapter periodRepositoryAdapter;
    private final CourseRepositoryAdapter courseRepositoryAdapter;
    private final PersonRepositoryAdapter personRepositoryAdapter;
    private final ClassroomRepositoryAdapter classroomRepositoryAdapter;

    @Override
    public Schedule save(Schedule schedule) {
        ScheduleEntity entity = toEntity(schedule);
        ScheduleEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Schedule> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Schedule> findAll() {
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

    private ScheduleEntity toEntity(Schedule schedule) {
        ScheduleEntity entity = new ScheduleEntity();
        entity.setId(schedule.getId());

        PeriodEntity period = new PeriodEntity();
        period.setId(schedule.getIdPeriod().getId());
        entity.setIdPeriod(period);

        CourseEntity course = new CourseEntity();
        course.setId(schedule.getIdCourse().getId());
        entity.setIdCourse(course);

        PersonEntity teacher = new PersonEntity();
        teacher.setId(schedule.getIdTeacher().getId());
        entity.setIdTeacher(teacher);

        ClassroomEntity classroom = new ClassroomEntity();
        classroom.setId(schedule.getIdClassroom().getId());
        entity.setIdClassroom(classroom);

        entity.setDay(schedule.getDay());
        entity.setStartTime(schedule.getStartTime());
        entity.setEndTime(schedule.getEndTime());
        return entity;
    }

    public Schedule toDomain(ScheduleEntity entity) {
        return new Schedule(
                entity.getId(),
                periodRepositoryAdapter.toDomain(entity.getIdPeriod()),
                courseRepositoryAdapter.toDomain(entity.getIdCourse()),
                personRepositoryAdapter.toDomain(entity.getIdTeacher()),
                classroomRepositoryAdapter.toDomain(entity.getIdClassroom()),
                entity.getDay(),
                entity.getStartTime(),
                entity.getEndTime()
        );
    }
}
