CREATE TABLE academic_years (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    name VARCHAR(120) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(24) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_academic_years_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_academic_years_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT uk_academic_years_school_name UNIQUE (school_id, name)
);

CREATE TABLE class_levels (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    academic_year_id VARCHAR(36) NOT NULL,
    name VARCHAR(120) NOT NULL,
    display_order INT NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_class_levels_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_class_levels_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_class_levels_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    CONSTRAINT uk_class_levels_year_name UNIQUE (academic_year_id, name)
);

CREATE TABLE sections (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    class_level_id VARCHAR(36) NOT NULL,
    name VARCHAR(80) NOT NULL,
    capacity INT,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_sections_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_sections_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_sections_class_level FOREIGN KEY (class_level_id) REFERENCES class_levels(id),
    CONSTRAINT uk_sections_class_name UNIQUE (class_level_id, name)
);

CREATE INDEX idx_academic_years_tenant_school ON academic_years(tenant_id, school_id);
CREATE INDEX idx_class_levels_year ON class_levels(academic_year_id);
CREATE INDEX idx_sections_class_level ON sections(class_level_id);
