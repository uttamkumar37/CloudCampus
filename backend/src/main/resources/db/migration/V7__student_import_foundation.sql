ALTER TABLE students ADD COLUMN class_level_id VARCHAR(36);
ALTER TABLE students ADD COLUMN section_id VARCHAR(36);
ALTER TABLE students ADD COLUMN roll_number VARCHAR(40);
ALTER TABLE students ADD COLUMN date_of_birth DATE;
ALTER TABLE students ADD COLUMN gender VARCHAR(40);
ALTER TABLE students ADD COLUMN guardian_name VARCHAR(180);
ALTER TABLE students ADD COLUMN guardian_email VARCHAR(180);
ALTER TABLE students ADD COLUMN guardian_mobile VARCHAR(40);
ALTER TABLE students ADD COLUMN imported_at TIMESTAMP;

ALTER TABLE students ADD CONSTRAINT fk_students_class_level FOREIGN KEY (class_level_id) REFERENCES class_levels(id);
ALTER TABLE students ADD CONSTRAINT fk_students_section FOREIGN KEY (section_id) REFERENCES sections(id);

CREATE INDEX idx_students_school_class_section ON students(school_id, class_level_id, section_id);
