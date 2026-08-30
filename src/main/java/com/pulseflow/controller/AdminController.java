package com.pulseflow.controller;

import com.pulseflow.dto.BackgroundJobDto;
import com.pulseflow.dto.FeatureFlagDto;
import com.pulseflow.dto.UserDto;
import com.pulseflow.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/feature-flags")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_WORKSPACE_ADMIN')")
    public ResponseEntity<List<FeatureFlagDto>> getFeatureFlags() {
        return ResponseEntity.ok(adminService.getFeatureFlags());
    }

    @PutMapping("/feature-flags/{key}")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<FeatureFlagDto> toggleFeatureFlag(@PathVariable String key) {
        return adminService.toggleFeatureFlag(key)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/background-jobs")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_WORKSPACE_ADMIN')")
    public ResponseEntity<List<BackgroundJobDto>> getBackgroundJobs() {
        return ResponseEntity.ok(adminService.getBackgroundJobs());
    }

    @PostMapping("/background-jobs/{id}/trigger")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<BackgroundJobDto> triggerBackgroundJob(@PathVariable String id) {
        return ResponseEntity.ok(adminService.triggerBackgroundJob(id));
    }

    @PostMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto request) {
        if (request.getName() == null || request.getEmail() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createUser(request));
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<UserDto> updateUserRole(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String role = (String) body.get("role");
        if (role == null) return ResponseEntity.badRequest().build();
        return adminService.updateUserRole(id, role)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/lock")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<UserDto> toggleUserLock(@PathVariable String id) {
        return adminService.toggleUserLock(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
