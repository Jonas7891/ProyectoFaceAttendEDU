package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.IotDevice;
import com.faceattend_edu.domain.port.IotDeviceRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.ClassroomEntity;
import com.faceattend_edu.infrastructure.persistence.entity.IotDeviceEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class IotDeviceRepositoryAdapter implements IotDeviceRepositoryPort {

    private final IotDeviceJpaRepository jpaRepository;
    private final ClassroomRepositoryAdapter classroomRepositoryAdapter;


    @Override
    public IotDevice save(IotDevice iotDevice) {
        IotDeviceEntity entity = toEntity(iotDevice);
        IotDeviceEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<IotDevice> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<IotDevice> findAll() {
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

    private IotDeviceEntity toEntity(IotDevice iotDevice) {
        IotDeviceEntity entity = new IotDeviceEntity();
        entity.setId(iotDevice.getId());

        ClassroomEntity classroom = new ClassroomEntity();
        classroom.setId(iotDevice.getIdClassroom().getId());
        entity.setIdClassroom(classroom);

        entity.setDeviceName(iotDevice.getDeviceName());
        entity.setMacAddress(iotDevice.getMacAddress());
        entity.setIpAddress(iotDevice.getIpAddress());
        entity.setStatus(iotDevice.getStatus());
        entity.setLastConnection(iotDevice.getLastConnection());
        entity.setObservation(iotDevice.getObservation());
        return entity;
    }

    public IotDevice toDomain(IotDeviceEntity entity) {
        return new IotDevice(
                entity.getId(),
                classroomRepositoryAdapter.toDomain(entity.getIdClassroom()),
                entity.getDeviceName(),
                entity.getMacAddress(),
                entity.getIpAddress(),
                entity.getStatus(),
                entity.getLastConnection(),
                entity.getObservation()
        );
    }
}
