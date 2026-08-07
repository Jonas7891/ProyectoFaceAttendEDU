package com.faceattend_edu.util.application;

import com.faceattend_edu.newModule.domain.exception.NotFoundException;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Function;

public abstract class AbstractServiceImpl<Model, Response, Request, Patch, ID>
        implements AbstractService<Request, Response, Patch, ID> {

    protected abstract AbstractRepositoryPort<Model, ID> getRepository();

    protected abstract String getEntityName();

    protected abstract Function<Request, Model> toDomainMapper();

    protected abstract Function<Model, Response> toResponseMapper();

    protected abstract BiConsumer<Model, Request> updateMerger();

    protected abstract BiConsumer<Model, Patch> partialUpdate();

    protected abstract BiConsumer<Model, Boolean> setStatus();

    // ── CRUD genérico ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Response findById(ID id) {
        Model model = getRepository().findById(id)
                .orElseThrow(() -> new NotFoundException(getEntityName(), id));
        return toResponseMapper().apply(model);
    }

    @Override
    @Transactional
    public List<Response> findAll() {
        return getRepository().findAll()
                .stream()
                .map(toResponseMapper())
                .toList();
    }

    @Override
    @Transactional
    public Response save(Request request) {
        Model model = toDomainMapper().apply(request);
        Model saved = getRepository().save(model);
        return toResponseMapper().apply(saved);
    }

    @Override
    @Transactional
    public Response update(ID id, Request request) {
        Model existing = getRepository().findById(id)
                .orElseThrow(() -> new NotFoundException(getEntityName(), id));
        updateMerger().accept(existing, request);
        Model saved = getRepository().save(existing);
        return toResponseMapper().apply(saved);
    }

    @Override
    @Transactional
    public void deleteById(ID id) {
        if (!getRepository().existsById(id)) {
            throw new NotFoundException(getEntityName(), id);
        }
        getRepository().deleteById(id);
    }

    @Override
    @Transactional
    public void logicalDelete(ID id) {
        Model model = getRepository().findById(id)
                .orElseThrow(() -> new NotFoundException(getEntityName(), id));
        setStatus().accept(model, false);
        getRepository().save(model);
    }

    @Override
    @Transactional
    public void partialUpdate(ID id, Patch patch) {
        Model model = getRepository().findById(id)
                .orElseThrow(() -> new NotFoundException(getEntityName(), id));
        partialUpdate().accept(model, patch);
        Model saved = getRepository().save(model);
        toResponseMapper().apply(saved);
    }
}
