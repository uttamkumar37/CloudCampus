package com.cloudcampus.operations.timetable;

import java.util.List;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
public class TimetableController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final TimetableService timetableService;

    public TimetableController(
            AuthenticatedUserResolver authenticatedUserResolver,
            TimetableService timetableService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.timetableService = timetableService;
    }

    @PostMapping("/v1/school-admin/timetable")
    ResponseEntity<TimetableEntryResponse> create(
            @Valid @RequestBody TimetableEntryRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timetableService.create(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping("/v1/school-admin/timetable")
    ResponseEntity<List<TimetableEntryResponse>> list(HttpServletRequest request) {
        return ResponseEntity.ok(timetableService.list(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/school-admin/timetable/{timetableEntryId}")
    ResponseEntity<TimetableEntryResponse> read(
            @PathVariable String timetableEntryId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(timetableService.read(
                authenticatedUserResolver.requireUser(request),
                timetableEntryId
        ));
    }
}
