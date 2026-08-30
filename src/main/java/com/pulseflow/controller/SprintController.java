package com.pulseflow.controller;

import com.pulseflow.dto.SprintDto;
import com.pulseflow.service.SprintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    @Autowired
    private SprintService sprintService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SprintDto>> getSprints(@RequestParam(required = false) String projectId) {
        return ResponseEntity.ok(sprintService.getSprints(projectId));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_PM')")
    public ResponseEntity<SprintDto> createSprint(@RequestBody SprintDto request) {
        if (request.getProjectId() == null || request.getName() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(sprintService.createSprint(request));
    }
}
