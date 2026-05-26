CREATE TABLE subjects (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    code VARCHAR(40) NOT NULL,
    name VARCHAR(120) NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_subjects_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_subjects_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT uk_subjects_school_code UNIQUE (school_id, code)
);

CREATE TABLE class_subject_assignments (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    class_level_id VARCHAR(36) NOT NULL,
    subject_id VARCHAR(36) NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_class_subjects_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_class_subjects_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_class_subjects_class_level FOREIGN KEY (class_level_id) REFERENCES class_levels(id),
    CONSTRAINT fk_class_subjects_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT uk_class_subjects_class_subject UNIQUE (class_level_id, subject_id)
);

CREATE TABLE teacher_assignments (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    teacher_user_id VARCHAR(36) NOT NULL,
    class_subject_assignment_id VARCHAR(36) NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_teacher_assignments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_teacher_assignments_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_teacher_assignments_teacher FOREIGN KEY (teacher_user_id) REFERENCES user_accounts(id),
    CONSTRAINT fk_teacher_assignments_class_subject FOREIGN KEY (class_subject_assignment_id) REFERENCES class_subject_assignments(id),
    CONSTRAINT uk_teacher_assignments_teacher_class_subject UNIQUE (teacher_user_id, class_subject_assignment_id)
);

CREATE INDEX idx_subjects_school ON subjects(school_id);
CREATE INDEX idx_class_subjects_class ON class_subject_assignments(class_level_id);
CREATE INDEX idx_teacher_assignments_teacher ON teacher_assignments(teacher_user_id);
