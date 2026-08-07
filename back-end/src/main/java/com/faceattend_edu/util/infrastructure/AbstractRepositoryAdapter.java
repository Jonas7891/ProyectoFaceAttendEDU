package com.faceattend_edu.util.infrastructure;

import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

@Component
@AllArgsConstructor
@Transactional
public abstract class AbstractRepositoryAdapter<Entity, Model, ID>
        implements AbstractRepositoryPort<Model, ID> {

    protected abstract JpaRepository<Entity, ID> getJpaRepository();

    protected abstract Function<Model, Entity> toEntityMapper();

    protected abstract Function<Entity, Model> toDomainMapper();

    @Override
    public Model save(Model model) {
        Entity entity = toEntityMapper().apply(model);
        Entity saved = getJpaRepository().save(entity);
        return toDomainMapper().apply(saved);
    }

    @Override
    public Optional<Model> findById(ID id) {
        return getJpaRepository().findById(id)
                .map(toDomainMapper());
    }

    @Override
    public boolean existsById(ID id) {
        return getJpaRepository().existsById(id);
    }

    @Override
    public List<Model> findAll() {
        return getJpaRepository().findAll()
                .stream()
                .map(toDomainMapper())
                .toList();
    }

    @Override
    public void deleteById(ID id) {
        getJpaRepository().deleteById(id);
    }
}
