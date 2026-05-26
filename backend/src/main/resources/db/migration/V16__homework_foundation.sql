CREATE TABLE homework_assignments (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    class_level_id VARCHAR(36) NOT NULL,
    section_id VARCHAR(36),
    subject_id VARCHAR(36) NOT NULL,
    created_by_user_id VARCHAR(36) NOT NULL,
    created_by_role VARCHAR(40) NOT NULL,
    title VARCHAR(160) NOT NULL,
    instructions VARCHAR(2000) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    published_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_homework_assignments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_homework_assignments_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_homework_assignments_class_level FOREIGN KEY (class_level_id) REFERENCES class_levels(id),
    CONSTRAINT fk_homework_assignments_section FOREIGN KEY (section_id) REFERENCES sections(id),
    CONSTRAINT fk_homework_assignments_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_homework_assignments_created_by FOREIGN KEY (created_by_user_id) REFERENCES user_accounts(id)
);

CREATE TABLE homework_submissions (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    homework_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    submitted_by_user_id VARCHAR(36) NOT NULL,
    content VARCHAR(2000) NOT NULL,
    submitted_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_homework_submissions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_homework_submissions_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_homework_submissions_homework FOREIGN KEY (homework_id) REFERENCES homework_assignments(id),
    CONSTRAINT fk_homework_submissions_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_homework_submissions_user FOREIGN KEY (submitted_by_user_id) REFERENCES user_accounts(id),
    CONSTRAINT uk_homework_submissions_homework_student UNIQUE (homework_id, student_id)
);

CREATE INDEX idx_homework_assignments_school_due ON homework_assignments(school_id, due_date);
CREATE INDEX idx_homework_assignments_class_subject ON homework_assignments(class_level_id, subject_id);
CREATE INDEX idx_homework_submissions_homework ON homework_submissions(homework_id);
CREATE INDEX idx_homework_submissions_student ON homework_submissions(student_id);
