CREATE TABLE ai_knowledge_documents (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    title VARCHAR(180) NOT NULL,
    category VARCHAR(60) NOT NULL,
    content TEXT NOT NULL,
    visible_to_roles VARCHAR(500) NOT NULL,
    status VARCHAR(24) NOT NULL,
    created_by_user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_ai_knowledge_documents_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_ai_knowledge_documents_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_ai_knowledge_documents_actor FOREIGN KEY (created_by_user_id) REFERENCES user_accounts(id)
);

CREATE INDEX idx_ai_knowledge_documents_school_status ON ai_knowledge_documents(school_id, status);
CREATE INDEX idx_ai_knowledge_documents_tenant_school ON ai_knowledge_documents(tenant_id, school_id);

CREATE TABLE ai_retrieval_audits (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36),
    user_id VARCHAR(36) NOT NULL,
    user_role VARCHAR(40) NOT NULL,
    feature VARCHAR(60) NOT NULL,
    query_sha256 VARCHAR(64) NOT NULL,
    query_length INTEGER NOT NULL,
    result_count INTEGER NOT NULL,
    status VARCHAR(24) NOT NULL,
    denial_reason VARCHAR(240),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_ai_retrieval_audits_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_ai_retrieval_audits_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_ai_retrieval_audits_user FOREIGN KEY (user_id) REFERENCES user_accounts(id),
    CONSTRAINT chk_ai_retrieval_query_length CHECK (query_length >= 0),
    CONSTRAINT chk_ai_retrieval_result_count CHECK (result_count >= 0)
);

CREATE INDEX idx_ai_retrieval_audits_tenant_created ON ai_retrieval_audits(tenant_id, created_at);
CREATE INDEX idx_ai_retrieval_audits_school_created ON ai_retrieval_audits(school_id, created_at);
