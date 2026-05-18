package com.cloudcampus.finance.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.finance.dto.CreateFeeCategoryRequest;
import com.cloudcampus.finance.dto.CreateFeeStructureRequest;
import com.cloudcampus.finance.dto.CreateStudentFeeRecordRequest;
import com.cloudcampus.finance.dto.FeeCategoryResponse;
import com.cloudcampus.finance.dto.FeePaymentResponse;
import com.cloudcampus.finance.dto.FeeReceiptResponse;
import com.cloudcampus.finance.dto.FeeStructureResponse;
import com.cloudcampus.finance.dto.RecordPaymentRequest;
import com.cloudcampus.finance.dto.StudentFeeRecordResponse;
import com.cloudcampus.finance.entity.FeeCategory;
import com.cloudcampus.finance.entity.FeeFrequency;
import com.cloudcampus.finance.entity.FeePayment;
import com.cloudcampus.finance.entity.FeeStatus;
import com.cloudcampus.finance.entity.FeeStructure;
import com.cloudcampus.finance.entity.StudentFeeRecord;
import com.cloudcampus.common.metrics.BusinessMetrics;
import com.cloudcampus.finance.repository.FeeCategoryRepository;
import com.cloudcampus.finance.repository.FeePaymentRepository;
import com.cloudcampus.finance.repository.FeeStructureRepository;
import com.cloudcampus.finance.repository.StudentFeeRecordRepository;
import io.micrometer.tracing.annotation.NewSpan;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Year;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
class FeeServiceImpl implements FeeService {

    private final FeeCategoryRepository      categoryRepo;
    private final FeeStructureRepository     structureRepo;
    private final StudentFeeRecordRepository recordRepo;
    private final FeePaymentRepository       paymentRepo;
    private final BusinessMetrics            metrics;

    FeeServiceImpl(FeeCategoryRepository      categoryRepo,
                   FeeStructureRepository     structureRepo,
                   StudentFeeRecordRepository recordRepo,
                   FeePaymentRepository       paymentRepo,
                   BusinessMetrics            metrics) {
        this.categoryRepo  = categoryRepo;
        this.structureRepo = structureRepo;
        this.recordRepo    = recordRepo;
        this.paymentRepo   = paymentRepo;
        this.metrics       = metrics;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fee Categories
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public FeeCategoryResponse createCategory(UUID schoolId, CreateFeeCategoryRequest req) {
        if (categoryRepo.existsBySchoolIdAndName(schoolId, req.name())) {
            throw new BadRequestException("Fee category '" + req.name() + "' already exists for this school");
        }
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        FeeCategory saved = categoryRepo.save(
                FeeCategory.create(tenantId, schoolId, req.name(), req.description()));
        return FeeCategoryResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeCategoryResponse> listCategories(UUID schoolId, boolean activeOnly) {
        List<FeeCategory> list = activeOnly
                ? categoryRepo.findActiveBySchoolId(schoolId)
                : categoryRepo.findBySchoolId(schoolId);
        return list.stream().map(FeeCategoryResponse::from).toList();
    }

    @Override
    @Transactional
    public FeeCategoryResponse deactivateCategory(UUID categoryId) {
        FeeCategory cat = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Fee category not found: " + categoryId));
        cat.deactivate();
        return FeeCategoryResponse.from(categoryRepo.save(cat));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fee Structures
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public FeeStructureResponse createStructure(UUID schoolId, CreateFeeStructureRequest req) {
        // Verify category exists and belongs to this school
        FeeCategory category = categoryRepo.findById(req.feeCategoryId())
                .orElseThrow(() -> new NotFoundException("Fee category not found: " + req.feeCategoryId()));
        if (!category.getSchoolId().equals(schoolId)) {
            throw new BadRequestException("Fee category does not belong to this school");
        }

        // Guard duplicate
        if (structureRepo.existsBySchoolIdAndAcademicYearIdAndClassIdAndFeeCategoryId(
                schoolId, req.academicYearId(), req.classId(), req.feeCategoryId())) {
            throw new BadRequestException("Fee structure already exists for this category/class/year combination");
        }

        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        FeeFrequency freq = req.frequency() == null ? FeeFrequency.ANNUAL : req.frequency();

        FeeStructure saved = structureRepo.save(
                FeeStructure.create(tenantId, schoolId,
                        req.academicYearId(), req.classId(), req.feeCategoryId(),
                        req.amount(), req.dueDate(), freq));

        return FeeStructureResponse.from(saved, category.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeStructureResponse> listStructures(UUID schoolId, UUID academicYearId) {
        List<FeeStructure> structures = academicYearId != null
                ? structureRepo.findBySchoolIdAndAcademicYearId(schoolId, academicYearId)
                : structureRepo.findBySchoolId(schoolId);

        // Batch-load categories to avoid N+1
        List<UUID> catIds = structures.stream()
                .map(FeeStructure::getFeeCategoryId)
                .distinct()
                .toList();
        Map<UUID, String> catNames = new HashMap<>();
        categoryRepo.findAllById(catIds)
                .forEach(c -> catNames.put(c.getId(), c.getName()));

        return structures.stream()
                .map(s -> FeeStructureResponse.from(s, catNames.getOrDefault(s.getFeeCategoryId(), "")))
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Student Fee Records
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public StudentFeeRecordResponse createRecord(UUID schoolId, CreateStudentFeeRecordRequest req) {
        // Guard duplicate
        if (recordRepo.existsByStudentIdAndFeeStructureId(req.studentId(), req.feeStructureId())) {
            throw new BadRequestException("Fee record already exists for this student and fee structure");
        }

        FeeStructure structure = structureRepo.findById(req.feeStructureId())
                .orElseThrow(() -> new NotFoundException("Fee structure not found: " + req.feeStructureId()));

        String categoryName = categoryRepo.findById(structure.getFeeCategoryId())
                .map(FeeCategory::getName)
                .orElse("");

        BigDecimal discount = req.discount() == null ? BigDecimal.ZERO : req.discount();

        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        StudentFeeRecord saved = recordRepo.save(
                StudentFeeRecord.create(tenantId, schoolId,
                        req.studentId(), req.feeStructureId(), req.academicYearId(),
                        req.amountDue(), discount, req.dueDate(), req.notes()));

        return StudentFeeRecordResponse.from(saved, categoryName);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentFeeRecordResponse> listRecordsByStudent(UUID studentId, UUID academicYearId) {
        List<StudentFeeRecord> records = academicYearId != null
                ? recordRepo.findByStudentIdAndAcademicYearId(studentId, academicYearId)
                : recordRepo.findByStudentId(studentId);
        return enrichRecords(records);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentFeeRecordResponse> listRecordsBySchool(UUID schoolId, UUID academicYearId,
                                                              FeeStatus status) {
        List<StudentFeeRecord> records;
        if (academicYearId != null) {
            records = status != null
                    ? recordRepo.findBySchoolIdAndAcademicYearIdAndStatus(schoolId, academicYearId, status)
                    : recordRepo.findBySchoolIdAndAcademicYearId(schoolId, academicYearId);
        } else {
            records = status != null
                    ? recordRepo.findBySchoolIdAndStatus(schoolId, status)
                    : recordRepo.findBySchoolId(schoolId);
        }
        return enrichRecords(records);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentFeeRecordResponse getRecord(UUID recordId) {
        StudentFeeRecord record = requireRecord(recordId);
        String catName = resolveCategoryName(record);
        return StudentFeeRecordResponse.from(record, catName);
    }

    @Override
    @Transactional
    public StudentFeeRecordResponse waiveRecord(UUID recordId) {
        StudentFeeRecord record = requireRecord(recordId);
        if (record.getStatus() == FeeStatus.PAID) {
            throw new BadRequestException("Cannot waive an already paid fee record");
        }
        record.waive();
        String catName = resolveCategoryName(record);
        return StudentFeeRecordResponse.from(recordRepo.save(record), catName);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Payments
    // ─────────────────────────────────────────────────────────────────────────

    @NewSpan("finance.recordPayment")
    @Override
    @Transactional
    public FeePaymentResponse recordPayment(UUID recordId, RecordPaymentRequest req) {
        StudentFeeRecord record = requireRecord(recordId);

        if (record.getStatus() == FeeStatus.PAID || record.getStatus() == FeeStatus.WAIVED) {
            throw new BadRequestException("Fee record is already " + record.getStatus().name().toLowerCase());
        }

        String receiptNumber = generateReceiptNumber(record.getSchoolId());

        FeePayment payment = FeePayment.create(
                recordId,
                req.amount(),
                req.paymentDate(),
                req.paymentMode(),
                req.referenceNumber(),
                receiptNumber,
                req.collectedByStaffId(),
                req.remarks());

        FeePayment saved = paymentRepo.save(payment);

        // Update the invoice
        record.applyPayment(req.amount());
        recordRepo.save(record);

        metrics.recordPayment(req.paymentMode().name(), req.amount());
        return FeePaymentResponse.from(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Receipt
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public FeeReceiptResponse getReceipt(UUID recordId) {
        StudentFeeRecord record = requireRecord(recordId);
        String catName   = resolveCategoryName(record);
        List<FeePayment> payments = paymentRepo.findByStudentFeeRecordId(recordId);
        return FeeReceiptResponse.from(record, catName, payments);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private StudentFeeRecord requireRecord(UUID recordId) {
        // findById() bypasses the Hibernate @Filter tenant scope — always use
        // findByIdAndTenantId() to prevent cross-tenant fee record access (CRIT-14).
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return recordRepo.findByIdAndTenantId(recordId, tenantId)
                .orElseThrow(() -> new NotFoundException("Fee record not found: " + recordId));
    }

    private String resolveCategoryName(StudentFeeRecord record) {
        return structureRepo.findById(record.getFeeStructureId())
                .flatMap(s -> categoryRepo.findById(s.getFeeCategoryId()))
                .map(FeeCategory::getName)
                .orElse("");
    }

    private List<StudentFeeRecordResponse> enrichRecords(List<StudentFeeRecord> records) {
        // Batch-load structures → categories
        List<UUID> structureIds = records.stream()
                .map(StudentFeeRecord::getFeeStructureId)
                .distinct()
                .toList();
        Map<UUID, UUID> structureToCat = new HashMap<>();
        structureRepo.findAllById(structureIds)
                .forEach(s -> structureToCat.put(s.getId(), s.getFeeCategoryId()));

        List<UUID> catIds = structureToCat.values().stream().distinct().toList();
        Map<UUID, String> catNames = new HashMap<>();
        categoryRepo.findAllById(catIds)
                .forEach(c -> catNames.put(c.getId(), c.getName()));

        return records.stream()
                .map(r -> {
                    UUID catId = structureToCat.get(r.getFeeStructureId());
                    String name = catId != null ? catNames.getOrDefault(catId, "") : "";
                    return StudentFeeRecordResponse.from(r, name);
                })
                .toList();
    }

    private String generateReceiptNumber(UUID schoolId) {
        String year = String.valueOf(Year.now().getValue());
        // nextval() is atomic at the DB level — eliminates the COUNT/WRITE race
        // condition that previously allowed duplicate receipt numbers (CRIT-13).
        long seq = paymentRepo.nextReceiptSequence();
        return "RCT-" + year + "-" + String.format("%07d", seq);
    }
}
