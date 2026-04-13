package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.Attendance;
import com.faceattend_edu.domain.port.AttendanceRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.AttendanceEntity;
import com.faceattend_edu.infrastructure.persistence.entity.IotDeviceEntity;
import com.faceattend_edu.infrastructure.persistence.entity.PersonEntity;
import com.faceattend_edu.infrastructure.persistence.entity.ScheduleEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class AttendanceRepositoryAdapter implements AttendanceRepositoryPort {

    private final AttendanceJpaRepository jpaRepository;

    private final PersonRepositoryAdapter personRepositoryAdapter;
    private final ScheduleRepositoryAdapter scheduleRepositoryAdapter;
    private final IotDeviceRepositoryAdapter iotDeviceRepositoryAdapter;

    @Override
    public Attendance save(Attendance attendance) {
        AttendanceEntity entity = toEntity(attendance);
        AttendanceEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Attendance> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Attendance> findAll() {
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

    private AttendanceEntity toEntity(Attendance attendance) {
        AttendanceEntity entity = new AttendanceEntity();

        PersonEntity student = new PersonEntity();
        student.setId(attendance.getIdStudent().getId());

        ScheduleEntity schedule = new ScheduleEntity();
        schedule.setId(attendance.getIdSchedule().getId());

        IotDeviceEntity iotDevice = new IotDeviceEntity();
        iotDevice.setId(attendance.getIdDevice().getId());

        entity.setId(attendance.getId());
        entity.setIdStudent(student);
        entity.setIdSchedule(schedule);
        entity.setIdDevice(iotDevice);
        entity.setDate(attendance.getDate());
        entity.setTime(attendance.getTime());
        entity.setStatus(attendance.getStatus());

        return entity;
    }

    public Attendance toDomain(AttendanceEntity entity) {
        return new Attendance(
                entity.getId(),
                personRepositoryAdapter.toDomain(entity.getIdStudent()),
                scheduleRepositoryAdapter.toDomain(entity.getIdSchedule()),
                iotDeviceRepositoryAdapter.toDomain(entity.getIdDevice()),
                entity.getDate(),
                entity.getTime(),
                entity.getStatus()
        );
    }
}
