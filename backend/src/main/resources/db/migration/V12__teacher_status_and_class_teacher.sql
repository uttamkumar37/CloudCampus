-- V12: Add status to teachers, add class_teacher_id to sections in all tenant schemas
DO $$
DECLARE
    schema_record RECORD;
BEGIN
    FOR schema_record IN SELECT schema_name FROM public.tenants LOOP
        EXECUTE format(
            'ALTER TABLE %I.teachers ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT ''ACTIVE''',
            schema_record.schema_name
        );
        EXECUTE format(
            'ALTER TABLE %I.sections ADD COLUMN IF NOT EXISTS class_teacher_id UUID REFERENCES %I.teachers(id) ON DELETE SET NULL',
            schema_record.schema_name, schema_record.schema_name
        );
    END LOOP;
END;
$$;
