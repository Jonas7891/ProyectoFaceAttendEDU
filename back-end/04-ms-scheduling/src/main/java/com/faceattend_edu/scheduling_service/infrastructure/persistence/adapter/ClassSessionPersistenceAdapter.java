package com.faceattend_edu.scheduling_service.infrastructure.persistence.adapter;

import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.model.ClassSessionFilter;
import com.faceattend_edu.scheduling_service.domain.model.ClassSessionStatus;
import java.time.LocalDate;
import com.faceattend_edu.scheduling_service.domain.port.out.ClassSessionRepository;
import com.faceattend_edu.scheduling_service.infrastructure.persistence.mapper.ClassSessionPersistenceMapper;
import com.faceattend_edu.scheduling_service.infrastructure.persistence.repository.ClassSessionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ClassSessionPersistenceAdapter implements ClassSessionRepository {
    /** Bound when a date filter is off; any in-range date works (LocalDate.MIN/MAX overflow PostgreSQL). */
    private static final LocalDate PLACEHOLDER_DATE = LocalDate.of(2000, 1, 1);
    private final ClassSessionJpaRepository jpaRepository;
    private final ClassSessionPersistenceMapper mapper;

    @Override public ClassSession save(ClassSession domain) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(domain)));
    }
    @Override public Optional<ClassSession> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }
    @Override public List<ClassSession> findAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).collect(Collectors.toList());
    }
    @Override public List<ClassSession> findByScheduleBlockId(Long scheduleBlockId) {
        return jpaRepository.findByScheduleBlockId(scheduleBlockId).stream().map(mapper::toDomain).collect(Collectors.toList());
    }
    @Override public List<ClassSession> search(ClassSessionFilter f, Integer schoolId) {
        return jpaRepository.search(
                f.scheduleBlockId() != null, f.scheduleBlockId() == null ? -1L : f.scheduleBlockId(),
                f.from() != null, f.from() == null ? PLACEHOLDER_DATE : f.from(),
                f.to() != null, f.to() == null ? PLACEHOLDER_DATE : f.to(),
                f.sessionStatus() != null, f.sessionStatus() == null ? ClassSessionStatus.OPEN.label() : f.sessionStatus(),
                schoolId != null, schoolId == null ? -1 : schoolId)
                .stream().map(mapper::toDomain).collect(Collectors.toList());
    }
    @Override public void deleteById(Long id) { jpaRepository.deleteById(id); }
    @Override public boolean existsById(Long id) { return jpaRepository.existsById(id); }
}
