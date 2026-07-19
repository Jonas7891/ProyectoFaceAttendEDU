package com.faceattend_edu.util.application;

import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;

import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Function;

public abstract class AbstractServiceImpl<Model, Response, Request, ID>
        implements AbstractService<Request, Response, ID> {

    protected abstract AbstractRepositoryPort<Model, ID> getRepository();

    protected abstract String getEntityName();

    protected abstract Function<Request, Model> toDomainMapper();

    protected abstract Function<Model, Response> toResponseMapper();

    protected abstract BiConsumer<Model, Request> updateMerger();

    // ── CRUD genérico ─────────────────────────────────────────────────────────

    @Override
    public Response findById(ID id) {
        Model model = getRepository().findById(id)
                .orElseThrow(() -> new NotFoundException(getEntityName(), id));
        return toResponseMapper().apply(model);
    }

    @Override
    public List<Response> findAll() {
        return getRepository().findAll()
                .stream()
                .map(toResponseMapper())
                .toList();
    }

    @Override
    public Response save(Request request) {
        Model model = toDomainMapper().apply(request);
        Model saved = getRepository().save(model);
        return toResponseMapper().apply(saved);
    }

    @Override
    public Response update(ID id, Request request) {
        Model existing = getRepository().findById(id)
                .orElseThrow(() -> new NotFoundException(getEntityName(), id));
        updateMerger().accept(existing, request);
        Model saved = getRepository().save(existing);
        return toResponseMapper().apply(saved);
    }

    @Override
    public void deleteById(ID id) {
        if (!getRepository().existsById(id)) {
            throw new NotFoundException(getEntityName(), id);
        }
        getRepository().deleteById(id);
    }
}
