package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.IotDevice;
import com.faceattend_edu.domain.port.IotDeviceRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.IotDeviceEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.IotDeviceRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.IotDeviceJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class IotDeviceRepositoryAdapter implements IotDeviceRepositoryPort {

    private final IotDeviceJpaRepository jpaRepository;
    private final IotDeviceRepositoryMapper mapper;


    @Override
    public IotDevice save(IotDevice iotDevice) {
        IotDeviceEntity entity = mapper.toEntity(iotDevice);
        IotDeviceEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<IotDevice> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<IotDevice> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

}
