package com.cloudcampus.academic;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/v1/school-admin/classes")
public class ClassLevelController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final AcademicLifecycleService academicLifecycleService;

    public ClassLevelController(
            AuthenticatedUserResolver authenticatedUserResolver,
            AcademicLifecycleService academicLifecycleService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.academicLifecycleService = academicLifecycleService;
    }

    @PostMapping
    ResponseEntity<ClassLevelResponse> create(
            @Valid @RequestBody ClassLevelRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicLifecycleService.createClassLevel(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping
    ResponseEntity<List<ClassLevelResponse>> list(
            @RequestParam @NotBlank String academicYearId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(academicLifecycleService.classLevels(
                authenticatedUserResolver.requireUser(request),
                academicYearId
        ));
    }
}
