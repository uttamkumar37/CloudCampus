package com.campuscloud.user.dto;

public class CreateUserRequest {
    private String username;
    private String email;
    private String password;
    private String role; // SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT
    private String tenantId;

    // Optional fields
    private String rollNumber;
    private String employeeNumber;
    private String classId;

    public CreateUserRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getEmployeeNumber() { return employeeNumber; }
    public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }

    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }
}
