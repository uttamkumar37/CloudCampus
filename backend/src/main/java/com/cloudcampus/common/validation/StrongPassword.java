package com.cloudcampus.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Validates that a password meets CloudCampus complexity rules (CC-0116):
 *
 *   • Minimum 8 characters
 *   • At least one uppercase letter (A–Z)
 *   • At least one lowercase letter (a–z)
 *   • At least one digit (0–9)
 *   • At least one special character (anything that is not a letter or digit)
 *
 * Apply to String fields on request DTOs that accept a new or reset password.
 * Use alongside @NotBlank — this validator returns true for null (null-safety
 * is delegated to @NotBlank so constraint ordering stays clear).
 */
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = StrongPasswordValidator.class)
public @interface StrongPassword {

    String message() default
            "Password must be at least 8 characters and contain uppercase, lowercase, digit, and special character";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
