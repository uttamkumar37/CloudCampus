ALTER TABLE students ADD COLUMN user_id VARCHAR(36);

ALTER TABLE students ADD CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES user_accounts(id);
ALTER TABLE students ADD CONSTRAINT uk_students_user UNIQUE (user_id);

CREATE INDEX idx_students_user ON students(user_id);
