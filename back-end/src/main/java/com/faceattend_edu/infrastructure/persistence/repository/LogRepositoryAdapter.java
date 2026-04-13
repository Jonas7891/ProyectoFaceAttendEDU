package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.Log;
import com.faceattend_edu.domain.port.LogRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.LogEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class LogRepositoryAdapter implements LogRepositoryPort {

    private final LogJpaRepository jpaRepository;
    private final UserRepositoryAdapter userRepositoryAdapter;

    @Override
    public Log save(Log log) {
        LogEntity entity = toEntity(log);
        LogEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Log> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Log> findAll() {
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

    private LogEntity toEntity(Log log) {
        LogEntity entity = new LogEntity();
        entity.setId(log.getId());

        UserEntity user = new UserEntity();
        user.setId(log.getIdUser().getId());
        entity.setIdUser(user);

        entity.setAction(log.getAction());
        entity.setTableName(log.getTableName());
        entity.setAffectedRecord(log.getAffectedRecord());
        entity.setDescription(log.getDescription());
        entity.setDate(log.getDate());
        return entity;
    }

    public Log toDomain(LogEntity entity) {
        return new Log(
                entity.getId(),
                userRepositoryAdapter.toDomain(entity.getIdUser()),
                entity.getAction(),
                entity.getTableName(),
                entity.getAffectedRecord(),
                entity.getDescription(),
                entity.getDate()
        );
    }
}
