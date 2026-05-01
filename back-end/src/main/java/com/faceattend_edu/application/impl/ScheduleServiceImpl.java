package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.ScheduleServiceMapper;
import com.faceattend_edu.application.service.ScheduleService;
import com.faceattend_edu.domain.dto.request.ScheduleRequest;
import com.faceattend_edu.domain.dto.response.ScheduleResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.*;
import com.faceattend_edu.domain.port.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepositoryPort repository;
    private final ScheduleServiceMapper mapper;

    private final PeriodRepositoryPort periodRepositoryPort;
    private final CourseRepositoryPort courseRepositoryPort;
    private final PersonRepositoryPort personRepositoryPort;
    private final ClassroomRepositoryPort classroomRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public ScheduleResponse findById(Integer id) {
        Schedule schedule = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule", id));
        return mapper.toResponse(schedule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleResponse save(ScheduleRequest request) {
        Period period = periodRepositoryPort.findById(request.periodId())
                .orElseThrow(() -> new NotFoundException("Period", request.periodId()));
        Course course = courseRepositoryPort.findById(request.courseId())
                .orElseThrow(() -> new NotFoundException("Course", request.courseId()));
        Person teacher = personRepositoryPort.findById(request.teacherId())
                .orElseThrow(() -> new NotFoundException("Teacher", request.teacherId()));
        Classroom classroom = classroomRepositoryPort.findById(request.classroomId())
                .orElseThrow(() -> new NotFoundException("Classroom", request.classroomId()));

        Schedule schedule = mapper.toDomain(request, period, course, teacher, classroom);
        Schedule saved = repository.save(schedule);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleResponse update(Integer id, ScheduleRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule", id));
        Period period = periodRepositoryPort.findById(request.periodId())
                .orElseThrow(() -> new NotFoundException("Period", request.periodId()));
        Course course = courseRepositoryPort.findById(request.courseId())
                .orElseThrow(() -> new NotFoundException("Course", request.courseId()));
        Person teacher = personRepositoryPort.findById(request.teacherId())
                .orElseThrow(() -> new NotFoundException("Teacher", request.teacherId()));
        Classroom classroom = classroomRepositoryPort.findById(request.classroomId())
                .orElseThrow(() -> new NotFoundException("Classroom", request.classroomId()));

        Schedule updated = mapper.toDomain(request, period, course, teacher, classroom);
        updated.setId(id);
        Schedule saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Schedule", id);
        }
        repository.deleteById(id);
    }
}
