package com.faceattend_edu.attendance_service.application.usecase;

import com.faceattend_edu.attendance_service.domain.model.AttendanceRecord;
import com.faceattend_edu.attendance_service.domain.port.in.ListAttendanceRecordsUseCase;
import com.faceattend_edu.attendance_service.domain.port.out.AttendanceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ListAttendanceRecordsUseCaseImpl implements ListAttendanceRecordsUseCase {
    private final AttendanceRecordRepository repository;
    @Override public List<AttendanceRecord> list(){ return repository.findAll(); }
}
