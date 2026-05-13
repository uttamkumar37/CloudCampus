-- V28 — Exam Subject Schedule (CC-1101)
-- One row per subject scheduled within an exam — defines the paper date,
-- time, duration and maximum marks for that specific paper.
CREATE TABLE exam_subjects (
    id              UUID         PRIMARY KEY,
    exam_id         UUID         NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    subject_id      UUID         NOT NULL REFERENCES subjects(id),
    class_id        UUID         NOT NULL REFERENCES classes(id),
    section_id      UUID,                    -- NULL = all sections
    exam_date       DATE         NOT NULL,
    start_time      TIME,
    duration_minutes INT,
    total_marks     NUMERIC(8,2) NOT NULL,
    passing_marks   NUMERIC(8,2) NOT NULL,
    room_number     VARCHAR(50),
    invigilator_id  UUID,                    -- staff_id
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT exam_subjects_marks_check CHECK (passing_marks <= total_marks AND total_marks > 0 AND passing_marks >= 0),
    CONSTRAINT exam_subjects_unique UNIQUE (exam_id, subject_id, class_id, section_id)
);

CREATE INDEX idx_exam_subjects_exam    ON exam_subjects(exam_id);
CREATE INDEX idx_exam_subjects_subject ON exam_subjects(subject_id);
CREATE INDEX idx_exam_subjects_class   ON exam_subjects(class_id);
CREATE INDEX idx_exam_subjects_date    ON exam_subjects(exam_date);
