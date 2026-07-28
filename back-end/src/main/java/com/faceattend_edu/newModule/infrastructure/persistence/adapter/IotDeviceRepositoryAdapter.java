package com.faceattend_edu.newModule.infrastructure.persistence.adapter;

import com.faceattend_edu.newModule.domain.model.IotDevice;
import com.faceattend_edu.newModule.domain.port.IotDeviceRepositoryPort;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.IotDeviceEntity;
import com.faceattend_edu.newModule.infrastructure.persistence.mapper.IotDeviceRepositoryMapper;
import com.faceattend_edu.newModule.infrastructure.persistence.repository.IotDeviceJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.function.Function;

@Component
@AllArgsConstructor
public class IotDeviceRepositoryAdapter
        extends AbstractRepositoryAdapter<IotDeviceEntity, IotDevice, UUID>
        implements IotDeviceRepositoryPort {

    private final IotDeviceJpaRepository jpaRepository;
    private final IotDeviceRepositoryMapper mapper;

    @Override
    protected JpaRepository<IotDeviceEntity, UUID> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<IotDevice, IotDeviceEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<IotDeviceEntity, IotDevice> toDomainMapper() {
        return mapper::toDomain;
    }
}
