package com.cloudcampus.bulk.service;

import com.cloudcampus.academic.entity.SchoolClass;
import com.cloudcampus.academic.entity.Section;
import com.cloudcampus.academic.repository.SchoolClassRepository;
import com.cloudcampus.academic.repository.SectionRepository;
import com.cloudcampus.bulk.dto.BulkUploadErrorResponse;
import com.cloudcampus.bulk.dto.BulkUploadResponse;
import com.cloudcampus.bulk.exception.BulkUploadValidationException;
import com.cloudcampus.student.entity.Gender;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.teacher.entity.Teacher;
import com.cloudcampus.teacher.repository.TeacherRepository;
import com.cloudcampus.tenant.service.TenantContext;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class BulkUploadServiceImpl implements BulkUploadService {

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024;
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private static final String STUDENTS_SHEET = "STUDENTS";
    private static final String TEACHERS_SHEET = "TEACHERS";
    private static final String CLASSES_SHEET = "CLASSES";
    private static final String SECTIONS_SHEET = "SECTIONS";

    private static final List<String> STUDENT_HEADERS = List.of(
            "admission_no", "first_name", "last_name", "dob", "gender", "email", "phone"
    );
    private static final List<String> TEACHER_HEADERS = List.of(
            "employee_no", "first_name", "last_name", "email", "phone", "hire_date"
    );
    private static final List<String> CLASS_HEADERS = List.of("class_name", "class_code");
    private static final List<String> SECTION_HEADERS = List.of("section_name", "class_code");

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SectionRepository sectionRepository;

    private final DataFormatter dataFormatter = new DataFormatter();

    @Override
    @Transactional
    public BulkUploadResponse uploadWorkbook(MultipartFile file) {
        validateTenantContext();
        validateFile(file);

        List<BulkUploadErrorResponse> errors = new ArrayList<>();
        int totalRows = 0;
        int successCount = 0;

        try (XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Map<String, Sheet> sheets = validateSheets(workbook);

            Set<String> classCodesInFile = new HashSet<>();
            Set<String> studentAdmissionNumbersInFile = new HashSet<>();
            Set<String> teacherEmployeeNumbersInFile = new HashSet<>();
            Set<String> sectionKeysInFile = new HashSet<>();
            Map<String, SchoolClass> resolvedClasses = new HashMap<>();

            UploadOutcome classOutcome = processClasses(
                    sheets.get(CLASSES_SHEET),
                    classCodesInFile,
                    resolvedClasses,
                    errors
            );
            totalRows += classOutcome.totalRows();
            successCount += classOutcome.successCount();

            UploadOutcome sectionOutcome = processSections(
                    sheets.get(SECTIONS_SHEET),
                    classCodesInFile,
                    sectionKeysInFile,
                    resolvedClasses,
                    errors
            );
            totalRows += sectionOutcome.totalRows();
            successCount += sectionOutcome.successCount();

            UploadOutcome studentOutcome = processStudents(
                    sheets.get(STUDENTS_SHEET),
                    studentAdmissionNumbersInFile,
                    errors
            );
            totalRows += studentOutcome.totalRows();
            successCount += studentOutcome.successCount();

            UploadOutcome teacherOutcome = processTeachers(
                    sheets.get(TEACHERS_SHEET),
                    teacherEmployeeNumbersInFile,
                    errors
            );
            totalRows += teacherOutcome.totalRows();
            successCount += teacherOutcome.successCount();
        } catch (IOException exception) {
            throw new BulkUploadValidationException("Unable to read the uploaded Excel workbook");
        }

        return new BulkUploadResponse(
                totalRows,
                successCount,
                errors.size(),
                errors
        );
    }

    @Override
    public Resource generateSampleWorkbook() {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            createSheet(workbook, STUDENTS_SHEET, STUDENT_HEADERS, List.of(
                    List.of("ADM-1001", "John", "Doe", "2010-05-12", "MALE", "john.doe@student.com", "9876543210")
            ));
            createSheet(workbook, TEACHERS_SHEET, TEACHER_HEADERS, List.of(
                    List.of("EMP-2001", "Jane", "Smith", "jane.smith@school.com", "9876543211", "2022-06-01")
            ));
            createSheet(workbook, CLASSES_SHEET, CLASS_HEADERS, List.of(
                    List.of("Grade 8", "G8"),
                    List.of("Grade 9", "G9")
            ));
            createSheet(workbook, SECTIONS_SHEET, SECTION_HEADERS, List.of(
                    List.of("A", "G8"),
                    List.of("B", "G9")
            ));

            workbook.write(outputStream);
            return new ByteArrayResource(outputStream.toByteArray());
        } catch (IOException exception) {
            throw new BulkUploadValidationException("Unable to generate sample workbook");
        }
    }

    private UploadOutcome processStudents(
            Sheet sheet,
            Set<String> admissionNumbersInFile,
            List<BulkUploadErrorResponse> errors
    ) {
        validateHeaders(sheet, STUDENT_HEADERS);
        int totalRows = 0;
        int successCount = 0;

        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (isRowEmpty(row, STUDENT_HEADERS.size())) {
                continue;
            }

            totalRows++;
            int displayRow = rowIndex + 1;
            try {
                String admissionNo = required(row, 0, "admission_no").toUpperCase(Locale.ROOT);
                String firstName = required(row, 1, "first_name");
                String lastName = required(row, 2, "last_name");
                LocalDate dateOfBirth = requiredDate(row, 3, "dob");
                Gender gender = requiredGender(row, 4);
                String email = optional(row, 5);
                String phone = optional(row, 6);

                if (dateOfBirth.isAfter(LocalDate.now())) {
                    throw new BulkUploadValidationException("dob must be in the past");
                }
                if (StringUtils.hasText(email) && !EMAIL_PATTERN.matcher(email).matches()) {
                    throw new BulkUploadValidationException("Invalid email");
                }
                if (!admissionNumbersInFile.add(admissionNo)) {
                    throw new BulkUploadValidationException("Duplicate admission_no in uploaded file");
                }
                if (studentRepository.existsByAdmissionNo(admissionNo)) {
                    throw new BulkUploadValidationException("admission_no already exists");
                }

                Student student = new Student();
                student.setAdmissionNo(admissionNo);
                student.setFirstName(firstName);
                student.setLastName(lastName);
                student.setDateOfBirth(dateOfBirth);
                student.setGender(gender);
                student.setEmail(normalizeEmail(email));
                student.setPhone(normalizeNullable(phone));
                student.setActive(true);
                studentRepository.save(student);
                successCount++;
            } catch (BulkUploadValidationException exception) {
                errors.add(new BulkUploadErrorResponse(STUDENTS_SHEET, displayRow, exception.getMessage()));
            }
        }

        return new UploadOutcome(totalRows, successCount);
    }

    private UploadOutcome processTeachers(
            Sheet sheet,
            Set<String> employeeNumbersInFile,
            List<BulkUploadErrorResponse> errors
    ) {
        validateHeaders(sheet, TEACHER_HEADERS);
        int totalRows = 0;
        int successCount = 0;

        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (isRowEmpty(row, TEACHER_HEADERS.size())) {
                continue;
            }

            totalRows++;
            int displayRow = rowIndex + 1;
            try {
                String employeeNo = required(row, 0, "employee_no").toUpperCase(Locale.ROOT);
                String firstName = required(row, 1, "first_name");
                String lastName = required(row, 2, "last_name");
                String email = required(row, 3, "email").toLowerCase(Locale.ROOT);
                String phone = optional(row, 4);
                LocalDate hireDate = requiredDate(row, 5, "hire_date");

                if (!EMAIL_PATTERN.matcher(email).matches()) {
                    throw new BulkUploadValidationException("Invalid email");
                }
                if (hireDate.isAfter(LocalDate.now())) {
                    throw new BulkUploadValidationException("hire_date must be in the past or present");
                }
                if (!employeeNumbersInFile.add(employeeNo)) {
                    throw new BulkUploadValidationException("Duplicate employee_no in uploaded file");
                }
                if (teacherRepository.existsByEmployeeNo(employeeNo)) {
                    throw new BulkUploadValidationException("employee_no already exists");
                }
                if (teacherRepository.existsByEmail(email)) {
                    throw new BulkUploadValidationException("email already exists");
                }

                Teacher teacher = new Teacher();
                teacher.setEmployeeNo(employeeNo);
                teacher.setFirstName(firstName);
                teacher.setLastName(lastName);
                teacher.setEmail(email);
                teacher.setPhone(normalizeNullable(phone));
                teacher.setHireDate(hireDate);
                teacher.setActive(true);
                teacherRepository.save(teacher);
                successCount++;
            } catch (BulkUploadValidationException exception) {
                errors.add(new BulkUploadErrorResponse(TEACHERS_SHEET, displayRow, exception.getMessage()));
            }
        }

        return new UploadOutcome(totalRows, successCount);
    }

    private UploadOutcome processClasses(
            Sheet sheet,
            Set<String> classCodesInFile,
            Map<String, SchoolClass> resolvedClasses,
            List<BulkUploadErrorResponse> errors
    ) {
        validateHeaders(sheet, CLASS_HEADERS);
        int totalRows = 0;
        int successCount = 0;

        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (isRowEmpty(row, CLASS_HEADERS.size())) {
                continue;
            }

            totalRows++;
            int displayRow = rowIndex + 1;
            try {
                String className = required(row, 0, "class_name");
                String classCode = required(row, 1, "class_code").toUpperCase(Locale.ROOT);

                if (!classCodesInFile.add(classCode)) {
                    throw new BulkUploadValidationException("Duplicate class_code in uploaded file");
                }
                if (schoolClassRepository.existsByCode(classCode)) {
                    throw new BulkUploadValidationException("class_code already exists");
                }

                SchoolClass schoolClass = new SchoolClass();
                schoolClass.setName(className);
                schoolClass.setCode(classCode);
                schoolClass.setActive(true);

                SchoolClass saved = schoolClassRepository.save(schoolClass);
                resolvedClasses.put(classCode, saved);
                successCount++;
            } catch (BulkUploadValidationException exception) {
                errors.add(new BulkUploadErrorResponse(CLASSES_SHEET, displayRow, exception.getMessage()));
            }
        }

        return new UploadOutcome(totalRows, successCount);
    }

    private UploadOutcome processSections(
            Sheet sheet,
            Set<String> classCodesInFile,
            Set<String> sectionKeysInFile,
            Map<String, SchoolClass> resolvedClasses,
            List<BulkUploadErrorResponse> errors
    ) {
        validateHeaders(sheet, SECTION_HEADERS);
        int totalRows = 0;
        int successCount = 0;

        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (isRowEmpty(row, SECTION_HEADERS.size())) {
                continue;
            }

            totalRows++;
            int displayRow = rowIndex + 1;
            try {
                String sectionName = required(row, 0, "section_name");
                String classCode = required(row, 1, "class_code").toUpperCase(Locale.ROOT);

                String sectionKey = sectionName.toLowerCase(Locale.ROOT) + "|" + classCode;
                if (!sectionKeysInFile.add(sectionKey)) {
                    throw new BulkUploadValidationException("Duplicate section for the same class in uploaded file");
                }

                SchoolClass schoolClass = resolvedClasses.get(classCode);
                if (schoolClass == null) {
                    schoolClass = schoolClassRepository.findByCode(classCode)
                            .orElseThrow(() -> new BulkUploadValidationException(
                                    "class_code not found. Create the class first in CLASSES sheet"
                            ));
                }

                Section section = new Section();
                section.setName(sectionName);
                section.setSchoolClass(schoolClass);
                section.setActive(true);
                sectionRepository.save(section);
                successCount++;
            } catch (BulkUploadValidationException exception) {
                errors.add(new BulkUploadErrorResponse(SECTIONS_SHEET, displayRow, exception.getMessage()));
            }
        }

        return new UploadOutcome(totalRows, successCount);
    }

    private Map<String, Sheet> validateSheets(XSSFWorkbook workbook) {
        Map<String, Sheet> sheets = new LinkedHashMap<>();
        List<String> requiredSheets = List.of(STUDENTS_SHEET, TEACHERS_SHEET, CLASSES_SHEET, SECTIONS_SHEET);

        for (String sheetName : requiredSheets) {
            Sheet sheet = workbook.getSheet(sheetName);
            if (sheet == null) {
                throw new BulkUploadValidationException("Missing required sheet: " + sheetName);
            }
            sheets.put(sheetName, sheet);
        }

        return sheets;
    }

    private void validateHeaders(Sheet sheet, List<String> expectedHeaders) {
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            throw new BulkUploadValidationException("Missing header row in sheet: " + sheet.getSheetName());
        }

        for (int columnIndex = 0; columnIndex < expectedHeaders.size(); columnIndex++) {
            String actual = normalizeHeader(getCellValue(headerRow.getCell(columnIndex)));
            if (!expectedHeaders.get(columnIndex).equals(actual)) {
                throw new BulkUploadValidationException(
                        "Invalid column at position " + (columnIndex + 1)
                                + " in sheet " + sheet.getSheetName()
                                + ". Expected " + expectedHeaders.get(columnIndex)
                );
            }
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BulkUploadValidationException("Please upload a non-empty Excel file");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BulkUploadValidationException("File size must be 5MB or less");
        }

        String filename = Optional.ofNullable(file.getOriginalFilename()).orElse("");
        if (!filename.toLowerCase(Locale.ROOT).endsWith(".xlsx")) {
            throw new BulkUploadValidationException("Only .xlsx files are supported");
        }
    }

    private void validateTenantContext() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new BulkUploadValidationException("X-Tenant-Slug header is required for bulk upload");
        }
    }

    private boolean isRowEmpty(Row row, int columns) {
        if (row == null) {
            return true;
        }
        for (int index = 0; index < columns; index++) {
            if (StringUtils.hasText(getCellValue(row.getCell(index)))) {
                return false;
            }
        }
        return true;
    }

    private String required(Row row, int index, String fieldName) {
        String value = getCellValue(row.getCell(index)).trim();
        if (!StringUtils.hasText(value)) {
            throw new BulkUploadValidationException(fieldName + " is required");
        }
        return value;
    }

    private String optional(Row row, int index) {
        String value = getCellValue(row.getCell(index)).trim();
        return StringUtils.hasText(value) ? value : null;
    }

    private LocalDate requiredDate(Row row, int index, String fieldName) {
        Cell cell = row.getCell(index);
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            throw new BulkUploadValidationException(fieldName + " is required");
        }
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }

        String rawValue = getCellValue(cell).trim();
        if (!StringUtils.hasText(rawValue)) {
            throw new BulkUploadValidationException(fieldName + " is required");
        }
        try {
            return LocalDate.parse(rawValue);
        } catch (DateTimeParseException exception) {
            throw new BulkUploadValidationException(fieldName + " must be in yyyy-MM-dd format");
        }
    }

    private Gender requiredGender(Row row, int index) {
        String rawValue = required(row, index, "gender").toUpperCase(Locale.ROOT);
        try {
            return Gender.valueOf(rawValue);
        } catch (IllegalArgumentException exception) {
            throw new BulkUploadValidationException("gender must be one of MALE, FEMALE, OTHER");
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) {
            return "";
        }
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue().toLocalDate().toString();
        }
        return dataFormatter.formatCellValue(cell);
    }

    private String normalizeHeader(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeNullable(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private void createSheet(XSSFWorkbook workbook, String sheetName, List<String> headers, List<List<String>> sampleRows) {
        Sheet sheet = workbook.createSheet(sheetName);
        Row headerRow = sheet.createRow(0);
        for (int index = 0; index < headers.size(); index++) {
            headerRow.createCell(index).setCellValue(headers.get(index));
            sheet.autoSizeColumn(index);
        }

        for (int rowIndex = 0; rowIndex < sampleRows.size(); rowIndex++) {
            Row row = sheet.createRow(rowIndex + 1);
            List<String> values = sampleRows.get(rowIndex);
            for (int cellIndex = 0; cellIndex < values.size(); cellIndex++) {
                row.createCell(cellIndex).setCellValue(values.get(cellIndex));
            }
        }
    }

    private record UploadOutcome(int totalRows, int successCount) {
    }
}
