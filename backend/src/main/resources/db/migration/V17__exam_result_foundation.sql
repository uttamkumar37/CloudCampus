CREATE TABLE exams (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    class_level_id VARCHAR(36) NOT NULL,
    section_id VARCHAR(36),
    subject_id VARCHAR(36) NOT NULL,
    created_by_user_id VARCHAR(36) NOT NULL,
    published_by_user_id VARCHAR(36),
    title VARCHAR(160) NOT NULL,
    exam_date DATE NOT NULL,
    max_marks DECIMAL(7, 2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    published_at TIMESTAMP,
    CONSTRAINT fk_exams_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_exams_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_exams_class_level FOREIGN KEY (class_level_id) REFERENCES class_levels(id),
    CONSTRAINT fk_exams_section FOREIGN KEY (section_id) REFERENCES sections(id),
    CONSTRAINT fk_exams_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_exams_created_by FOREIGN KEY (created_by_user_id) REFERENCES user_accounts(id),
    CONSTRAINT fk_exams_published_by FOREIGN KEY (published_by_user_id) REFERENCES user_accounts(id)
);

CREATE TABLE exam_results (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    exam_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    recorded_by_user_id VARCHAR(36) NOT NULL,
    marks_obtained DECIMAL(7, 2) NOT NULL,
    recorded_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_exam_results_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_exam_results_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_exam_results_exam FOREIGN KEY (exam_id) REFERENCES exams(id),
    CONSTRAINT fk_exam_results_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_exam_results_recorded_by FOREIGN KEY (recorded_by_user_id) REFERENCES user_accounts(id),
    CONSTRAINT uk_exam_results_exam_student UNIQUE (exam_id, student_id)
);

CREATE INDEX idx_exams_school_date ON exams(school_id, exam_date);
CREATE INDEX idx_exams_class_subject ON exams(class_level_id, subject_id);
CREATE INDEX idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX idx_exam_results_student ON exam_results(student_id);
