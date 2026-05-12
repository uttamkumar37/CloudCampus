-- ────────────────────────────────────────────────────────────────────────────
-- V34 — School Notices (Notice Board)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE school_notices (
    id              UUID        NOT NULL PRIMARY KEY,
    tenant_id       UUID        NOT NULL,
    school_id       UUID        NOT NULL REFERENCES schools(id),

    title           VARCHAR(300) NOT NULL,
    content         TEXT        NOT NULL,
    category        VARCHAR(30) NOT NULL CHECK (category IN (
                        'GENERAL','ACADEMIC','EXAM','FEE','HOLIDAY','CIRCULAR','URGENT'
                    )),
    target          VARCHAR(20) NOT NULL DEFAULT 'ALL' CHECK (target IN (
                        'ALL','STUDENT','PARENT','TEACHER','STAFF'
                    )),
    priority        SMALLINT    NOT NULL DEFAULT 0,   -- higher = more important
    is_published    BOOLEAN     NOT NULL DEFAULT FALSE,
    published_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,

    posted_by       UUID        REFERENCES users(id),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notices_school        ON school_notices(school_id);
CREATE INDEX idx_notices_school_pub    ON school_notices(school_id, is_published);
CREATE INDEX idx_notices_tenant        ON school_notices(tenant_id);
CREATE INDEX idx_notices_expires       ON school_notices(expires_at) WHERE expires_at IS NOT NULL;
