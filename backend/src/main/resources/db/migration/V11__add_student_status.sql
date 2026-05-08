-- V11: Add status column to students table in all tenant schemas
DO $$
DECLARE
    schema_record RECORD;
BEGIN
    FOR schema_record IN SELECT schema_name FROM public.tenants LOOP
        EXECUTE format(
            'ALTER TABLE %I.students ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT ''ACTIVE''',
            schema_record.schema_name
        );
    END LOOP;
END;
$$;
