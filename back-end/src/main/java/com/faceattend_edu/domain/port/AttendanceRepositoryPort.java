package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.Attendance;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepositoryPort {
    Attendance save(Attendance attendance);

    Optional<Attendance> findById(Integer id);

    List<Attendance> findAll();

    void deleteById(Integer id);
}
