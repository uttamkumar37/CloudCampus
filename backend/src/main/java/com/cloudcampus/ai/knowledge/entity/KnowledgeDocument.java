package com.cloudcampus.ai.knowledge.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Tracks a document that has been chunked and indexed into the vector store (CC-1603).
 * Raw embedding vectors live in {@code vector_store}; chunk IDs reference this doc via
 * the {@code doc_id} metadata field.
 */
@Entity
@Table(name = "knowledge_documents")
public class KnowledgeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "source_type", nullable = false, length = 50)
    private String sourceType = "MANUAL";

    @Column(name = "char_count", nullable = false)
    private int charCount;

    @Column(name = "chunk_count", nullable = false)
    private int chunkCount;

    @Column(name = "created_by", nullable = false, updatable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected KnowledgeDocument() {}

    @PreUpdate
    void onUpdate() { updatedAt = Instant.now(); }

    public static KnowledgeDocument create(UUID tenantId, UUID createdBy, String title,
                                           String sourceType, int charCount, int chunkCount) {
        KnowledgeDocument d = new KnowledgeDocument();
        d.tenantId   = tenantId;
        d.createdBy  = createdBy;
        d.title      = title;
        d.sourceType = sourceType;
        d.charCount  = charCount;
        d.chunkCount = chunkCount;
        return d;
    }

    public UUID    getId()         { return id; }
    public UUID    getTenantId()   { return tenantId; }
    public String  getTitle()      { return title; }
    public String  getSourceType() { return sourceType; }
    public int     getCharCount()  { return charCount; }
    public int     getChunkCount() { return chunkCount; }
    public UUID    getCreatedBy()  { return createdBy; }
    public Instant getCreatedAt()  { return createdAt; }
    public Instant getUpdatedAt()  { return updatedAt; }
}
