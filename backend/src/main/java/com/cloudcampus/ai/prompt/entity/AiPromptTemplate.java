package com.cloudcampus.ai.prompt.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_prompt_templates")
public class AiPromptTemplate {

    @Id
    private UUID id;

    @Column(name = "prompt_key", nullable = false)
    private String promptKey;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String template;

    @Column(columnDefinition = "TEXT")
    private String variables;   // JSON array, e.g. ["studentName","courseName"]

    @Column(nullable = false)
    private int version;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AiPromptTemplate() {}

    public static AiPromptTemplate create(String promptKey, String name, String description,
                                          String template, String variables,
                                          int version, UUID createdBy) {
        AiPromptTemplate t = new AiPromptTemplate();
        t.id          = UUID.randomUUID();
        t.promptKey   = promptKey;
        t.name        = name;
        t.description = description;
        t.template    = template;
        t.variables   = variables;
        t.version     = version;
        t.active      = false;
        t.createdBy   = createdBy;
        t.createdAt   = Instant.now();
        t.updatedAt   = t.createdAt;
        return t;
    }

    public void activate()   { this.active = true;  this.updatedAt = Instant.now(); }
    public void deactivate() { this.active = false; this.updatedAt = Instant.now(); }

    // Getters
    public UUID    getId()          { return id; }
    public String  getPromptKey()   { return promptKey; }
    public String  getName()        { return name; }
    public String  getDescription() { return description; }
    public String  getTemplate()    { return template; }
    public String  getVariables()   { return variables; }
    public int     getVersion()     { return version; }
    public boolean isActive()       { return active; }
    public UUID    getCreatedBy()   { return createdBy; }
    public Instant getCreatedAt()   { return createdAt; }
    public Instant getUpdatedAt()   { return updatedAt; }
}
