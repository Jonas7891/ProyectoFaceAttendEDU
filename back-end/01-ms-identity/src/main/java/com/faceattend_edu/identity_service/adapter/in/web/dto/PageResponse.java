package com.faceattend_edu.identity_service.adapter.in.web.dto;

import java.util.List;

/**
 * Envelope for collection responses, as mandated by
 * fae-docs/07-api/contracts/openapi/_shared.yaml (PaginatedMeta).
 */
public record PageResponse<T>(List<T> data, Meta meta) {

    public record Meta(int page, int limit, long total, int totalPages) {
    }

    public static final int MAX_LIMIT = 100;

    public static <T> PageResponse<T> of(List<T> items, Integer page, Integer limit) {
        List<T> all = items == null ? List.of() : items;
        int safeLimit = limit == null ? 20 : Math.min(Math.max(limit, 1), MAX_LIMIT);
        int safePage = page == null ? 1 : Math.max(page, 1);
        int total = all.size();
        int from = Math.min((safePage - 1) * safeLimit, total);
        int to = Math.min(from + safeLimit, total);
        int totalPages = (int) Math.ceil(total / (double) safeLimit);
        return new PageResponse<>(List.copyOf(all.subList(from, to)),
                new Meta(safePage, safeLimit, total, totalPages));
    }
}
