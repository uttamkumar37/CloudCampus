package com.cloudcampus.academic.service;

import com.cloudcampus.academic.dto.ClassCreateRequest;
import com.cloudcampus.academic.dto.ClassResponse;
import com.cloudcampus.academic.dto.SectionCreateRequest;
import com.cloudcampus.academic.dto.SectionResponse;
import com.cloudcampus.academic.dto.SubjectCreateRequest;
import com.cloudcampus.academic.dto.SubjectResponse;
import com.cloudcampus.academic.entity.SchoolClass;
import com.cloudcampus.academic.entity.Section;
import com.cloudcampus.academic.entity.Subject;
import com.cloudcampus.academic.repository.SchoolClassRepository;
import com.cloudcampus.academic.repository.SectionRepository;
import com.cloudcampus.academic.repository.SubjectRepository;
import com.cloudcampus.tenant.service.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class AcademicServiceImpl implements AcademicService {

    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;

    @Override
    @Transactional
    public ClassResponse createClass(ClassCreateRequest request) {
        validateTenantContext();

        String code = request.code().trim().toUpperCase(Locale.ROOT);
        if (schoolClassRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Class code already exists: " + code);
        }

        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setName(request.name().trim());
        schoolClass.setCode(code);
        schoolClass.setActive(true);

        SchoolClass saved = schoolClassRepository.save(schoolClass);
        log.info("Class created: code={}, tenant={}", saved.getCode(), TenantContext.getTenant());
        return mapClass(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassResponse> getClasses() {
        validateTenantContext();
        return schoolClassRepository.findAll().stream().map(this::mapClass).toList();
    }

    @Override
    @Transactional
    public SubjectResponse createSubject(SubjectCreateRequest request) {
        validateTenantContext();

        String code = request.code().trim().toUpperCase(Locale.ROOT);
        if (subjectRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Subject code already exists: " + code);
        }

        Subject subject = new Subject();
        subject.setName(request.name().trim());
        subject.setCode(code);
        subject.setActive(true);

        Subject saved = subjectRepository.save(subject);
        log.info("Subject created: code={}, tenant={}", saved.getCode(), TenantContext.getTenant());
        return mapSubject(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectResponse> getSubjects() {
        validateTenantContext();
        return subjectRepository.findAll().stream().map(this::mapSubject).toList();
    }

    @Override
    @Transactional
    public SectionResponse createSection(SectionCreateRequest request) {
        validateTenantContext();

        SchoolClass schoolClass = schoolClassRepository.findById(request.classId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + request.classId()));

        Section section = new Section();
        section.setName(request.name().trim());
        section.setSchoolClass(schoolClass);
        section.setActive(true);

        Section saved = sectionRepository.save(section);
        log.info("Section created: name={}, classCode={}, tenant={}", saved.getName(), schoolClass.getCode(), TenantContext.getTenant());
        return mapSection(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SectionResponse> getSections() {
        validateTenantContext();
        return sectionRepository.findAll().stream().map(this::mapSection).toList();
    }

    private void validateTenantContext() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-Slug header is required for academic operations");
        }
    }

    private ClassResponse mapClass(SchoolClass schoolClass) {
        return new ClassResponse(
                schoolClass.getId(),
                schoolClass.getName(),
                schoolClass.getCode(),
                schoolClass.isActive(),
                schoolClass.getCreatedAt()
        );
    }

    private SubjectResponse mapSubject(Subject subject) {
        return new SubjectResponse(
                subject.getId(),
                subject.getName(),
                subject.getCode(),
                subject.isActive(),
                subject.getCreatedAt()
        );
    }

    private SectionResponse mapSection(Section section) {
        return new SectionResponse(
                section.getId(),
                section.getName(),
                section.getSchoolClass().getId(),
                section.getSchoolClass().getName(),
                section.isActive(),
                section.getCreatedAt()
        );
    }
}
