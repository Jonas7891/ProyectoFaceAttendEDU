package com.faceattend_edu.util.application;

import java.util.List;
import java.util.Objects;
import java.util.function.BiConsumer;
import java.util.function.Supplier;

public final class ReferenceMapperUtils {

    private ReferenceMapperUtils() {
    }

    public static <T, ID> List<T> toReferences(List<ID> ids, Supplier<T> factory, BiConsumer<T, ID> idSetter) {
        if (ids == null) {
            return null;
        }
        return ids.stream()
                .filter(Objects::nonNull)
                .map(id -> {
                    T entity = factory.get();
                    idSetter.accept(entity, id);
                    return entity;
                })
                .toList();
    }
}
