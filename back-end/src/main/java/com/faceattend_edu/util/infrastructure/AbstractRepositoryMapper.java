package com.faceattend_edu.util.infrastructure;

public interface AbstractRepositoryMapper<Entity, Model> {
    Entity toEntity(Model model);

    Model toDomain(Entity entity);
}
