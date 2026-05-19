CREATE TABLE IF NOT EXISTS student_identity_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    school_id UUID NOT NULL,
    student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    government_id_type VARCHAR(80),
    government_id_number VARCHAR(200),
    nationality VARCHAR(80),
    religion VARCHAR(80),
    caste_category VARCHAR(80),
    mother_tongue VARCHAR(80),
    previous_school VARCHAR(200),
    enrollment_source VARCHAR(120),
    emergency_contact_name VARCHAR(160),
    emergency_contact_phone VARCHAR(80),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_identity_profiles_tenant_student
    ON student_identity_profiles (tenant_id, student_id);

CREATE TABLE IF NOT EXISTS student_logistics_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    school_id UUID NOT NULL,
    student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    transport_mode VARCHAR(80),
    route_name VARCHAR(160),
    pickup_point VARCHAR(200),
    drop_point VARCHAR(200),
    hostel_name VARCHAR(160),
    room_number VARCHAR(80),
    warden_contact VARCHAR(120),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_logistics_profiles_tenant_student
    ON student_logistics_profiles (tenant_id, student_id);

CREATE TABLE IF NOT EXISTS student_enrichment_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    school_id UUID NOT NULL,
    student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    interests TEXT,
    hobbies TEXT,
    likes TEXT,
    dislikes TEXT,
    skills TEXT,
    career_goals TEXT,
    learning_style VARCHAR(120),
    counseling_summary TEXT,
    ai_risk_level VARCHAR(40),
    ai_insights TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_enrichment_profiles_tenant_student
    ON student_enrichment_profiles (tenant_id, student_id);

CREATE TABLE IF NOT EXISTS student_medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    school_id UUID NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    condition_name VARCHAR(160) NOT NULL,
    severity VARCHAR(40),
    medication TEXT,
    doctor_contact VARCHAR(160),
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_medical_records_student_recorded
    ON student_medical_records (tenant_id, student_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS student_behavior_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    school_id UUID NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    severity VARCHAR(40),
    summary TEXT NOT NULL,
    action_taken TEXT,
    counselor_notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_behavior_records_student_recorded
    ON student_behavior_records (tenant_id, student_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS student_achievement_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    school_id UUID NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    awarded_on DATE,
    evidence_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_achievement_records_student_created
    ON student_achievement_records (tenant_id, student_id, created_at DESC);

CREATE TABLE IF NOT EXISTS student_communication_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    school_id UUID NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    channel VARCHAR(80) NOT NULL,
    direction VARCHAR(40) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    summary TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_communication_events_student_occurred
    ON student_communication_events (tenant_id, student_id, occurred_at DESC);
