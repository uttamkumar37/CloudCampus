create table timetable_entries (
    id varchar(36) primary key,
    tenant_id varchar(36) not null,
    school_id varchar(36) not null,
    class_level_id varchar(36) not null,
    section_id varchar(36),
    subject_id varchar(36),
    created_by_user_id varchar(36) not null,
    weekday varchar(16) not null,
    start_time time not null,
    end_time time not null,
    title varchar(160) not null,
    created_at timestamp not null,
    constraint fk_timetable_entries_tenant foreign key (tenant_id) references tenants(id),
    constraint fk_timetable_entries_school foreign key (school_id) references schools(id),
    constraint fk_timetable_entries_class foreign key (class_level_id) references class_levels(id),
    constraint fk_timetable_entries_section foreign key (section_id) references sections(id),
    constraint fk_timetable_entries_subject foreign key (subject_id) references subjects(id),
    constraint fk_timetable_entries_created_by foreign key (created_by_user_id) references user_accounts(id),
    constraint ck_timetable_entries_time_order check (end_time > start_time)
);

create index idx_timetable_entries_school_class on timetable_entries(school_id, class_level_id, section_id);

create table school_documents (
    id varchar(36) primary key,
    tenant_id varchar(36) not null,
    school_id varchar(36) not null,
    class_level_id varchar(36),
    student_id varchar(36),
    created_by_user_id varchar(36) not null,
    title varchar(180) not null,
    file_name varchar(220) not null,
    storage_key varchar(500) not null,
    created_at timestamp not null,
    constraint fk_school_documents_tenant foreign key (tenant_id) references tenants(id),
    constraint fk_school_documents_school foreign key (school_id) references schools(id),
    constraint fk_school_documents_class foreign key (class_level_id) references class_levels(id),
    constraint fk_school_documents_student foreign key (student_id) references students(id),
    constraint fk_school_documents_created_by foreign key (created_by_user_id) references user_accounts(id)
);

create index idx_school_documents_school on school_documents(school_id, created_at);

create table website_pages (
    id varchar(36) primary key,
    tenant_id varchar(36) not null,
    school_id varchar(36) not null,
    created_by_user_id varchar(36) not null,
    published_by_user_id varchar(36),
    slug varchar(120) not null,
    title varchar(180) not null,
    body text not null,
    status varchar(32) not null,
    created_at timestamp not null,
    published_at timestamp,
    constraint fk_website_pages_tenant foreign key (tenant_id) references tenants(id),
    constraint fk_website_pages_school foreign key (school_id) references schools(id),
    constraint fk_website_pages_created_by foreign key (created_by_user_id) references user_accounts(id),
    constraint fk_website_pages_published_by foreign key (published_by_user_id) references user_accounts(id),
    constraint uk_website_pages_school_slug unique (school_id, slug)
);

create index idx_website_pages_school_status on website_pages(school_id, status);
