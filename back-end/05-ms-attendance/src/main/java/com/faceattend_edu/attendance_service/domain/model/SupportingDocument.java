package com.faceattend_edu.attendance_service.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class SupportingDocument {
    private Long supportingDocumentId;
    private Long justificationId;
    private String fileName;
    private String storageUri;
    private String mimeType;
    private Long sizeBytes;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;
    private UUID createdBy;
    private UUID updatedBy;
    private UUID deletedBy;
    private long rowVersion;

    public void validate() {
        if (justificationId == null) throw new IllegalArgumentException("justificationId is required");
        if (isBlank(fileName)) throw new IllegalArgumentException("fileName is required");
        if (fileName.length() > 255) throw new IllegalArgumentException("fileName max 255");
        if (isBlank(storageUri)) throw new IllegalArgumentException("storageUri is required");
        if (storageUri.length() > 500) throw new IllegalArgumentException("storageUri max 500");
        if (isBlank(mimeType)) throw new IllegalArgumentException("mimeType is required");
        if (sizeBytes == null || sizeBytes <= 0) throw new IllegalArgumentException("sizeBytes must be > 0");
    }
    public void touchCreated(){ if(createdAt==null) createdAt=Instant.now(); if(rowVersion==0) rowVersion=1L; }
    public void touchUpdated(){ updatedAt=Instant.now(); }
    private static boolean isBlank(String s){ return s==null || s.trim().isEmpty(); }
    @Override public boolean equals(Object o){ if(this==o) return true; if(!(o instanceof SupportingDocument)) return false; SupportingDocument that=(SupportingDocument)o; return Objects.equals(supportingDocumentId, that.supportingDocumentId); }
    @Override public int hashCode(){ return Objects.hash(supportingDocumentId); }
}
