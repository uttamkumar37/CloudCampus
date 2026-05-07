-- V10: Extend website_config with branding, school profile, and hero CTA fields

ALTER TABLE public.website_config
    ADD COLUMN IF NOT EXISTS logo_url               VARCHAR(500),
    ADD COLUMN IF NOT EXISTS school_established_year INT,
    ADD COLUMN IF NOT EXISTS affiliation_board       VARCHAR(50),   -- CBSE, ICSE, State Board, IB, IGCSE
    ADD COLUMN IF NOT EXISTS medium_of_instruction   VARCHAR(50),   -- English, Hindi, Regional, Bilingual
    ADD COLUMN IF NOT EXISTS school_type             VARCHAR(50),   -- Co-educational, Boys Only, Girls Only
    ADD COLUMN IF NOT EXISTS student_count           INT,           -- approximate total students
    ADD COLUMN IF NOT EXISTS teacher_count           INT,           -- approximate total teachers
    ADD COLUMN IF NOT EXISTS hero_cta_text           VARCHAR(100),  -- CTA button label on hero
    ADD COLUMN IF NOT EXISTS hero_cta_link           VARCHAR(500),  -- CTA button href
    ADD COLUMN IF NOT EXISTS achievement_badge       VARCHAR(200),  -- "Top Ranked School 2025"
    ADD COLUMN IF NOT EXISTS notices_text            TEXT;          -- notice board body
