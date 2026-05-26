CREATE TABLE attendance_sessions (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    class_level_id VARCHAR(36) NOT NULL,
    section_id VARCHAR(36),
    subject_id VARCHAR(36) NOT NULL,
    submitted_by_user_id VARCHAR(36) NOT NULL,
    submitted_by_role VARCHAR(40) NOT NULL,
    attendance_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_attendance_sessions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_attendance_sessions_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_attendance_sessions_class_level FOREIGN KEY (class_level_id) REFERENCES class_levels(id),
    CONSTRAINT fk_attendance_sessions_section FOREIGN KEY (section_id) REFERENCES sections(id),
    CONSTRAINT fk_attendance_sessions_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_attendance_sessions_submitted_by FOREIGN KEY (submitted_by_user_id) REFERENCES user_accounts(id)
);

CREATE TABLE attendance_records (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    status VARCHAR(32) NOT NULL,
    remark VARCHAR(180),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_attendance_records_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_attendance_records_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_attendance_records_session FOREIGN KEY (session_id) REFERENCES attendance_sessions(id),
    CONSTRAINT fk_attendance_records_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT uk_attendance_records_session_student UNIQUE (session_id, student_id)
);

CREATE UNIQUE INDEX uk_attendance_sessions_scope_date
    ON attendance_sessions(school_id, class_level_id, section_id, subject_id, attendance_date);
CREATE INDEX idx_attendance_sessions_school_date ON attendance_sessions(school_id, attendance_date);
CREATE INDEX idx_attendance_sessions_class_subject ON attendance_sessions(class_level_id, subject_id);
CREATE INDEX idx_attendance_records_session ON attendance_records(session_id);
CREATE INDEX idx_attendance_records_student ON attendance_records(student_id);
