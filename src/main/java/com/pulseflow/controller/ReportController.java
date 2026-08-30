package com.pulseflow.controller;

import com.pulseflow.dto.AuditLogDto;
import com.pulseflow.dto.TaskDto;
import com.pulseflow.service.AuditLogService;
import com.pulseflow.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping("/tasks/csv")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_WORKSPACE_ADMIN', 'ROLE_PM')")
    public ResponseEntity<byte[]> exportTasksCsv() {
        List<TaskDto> tasks = taskService.getTasks(null, null, null, null, null);
        StringBuilder csv = new StringBuilder("Key,Title,Status,Priority,Project,Assignee,LoggedHours,EstimatedHours,DueDate\n");

        for (TaskDto t : tasks) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%s,%s,\"%s\"\n",
                    t.getKey(),
                    t.getTitle().replace("\"", "\"\""),
                    t.getStatus(),
                    t.getPriority(),
                    t.getProjectId(),
                    t.getAssigneeName() != null ? t.getAssigneeName() : "",
                    t.getLoggedHours(),
                    t.getEstimatedHours(),
                    t.getDueDate()
            ));
        }

        byte[] bytes = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"pulseflow-tasks-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    @GetMapping("/audit/csv")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_WORKSPACE_ADMIN')")
    public ResponseEntity<byte[]> exportAuditCsv() {
        List<AuditLogDto> logs = auditLogService.getAllAuditLogs();
        StringBuilder csv = new StringBuilder("Timestamp,Actor,Role,Action,EntityType,EntityName,Details\n");

        for (AuditLogDto l : logs) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    l.getTimestamp(),
                    l.getActorName(),
                    l.getActorRole(),
                    l.getAction(),
                    l.getEntityType(),
                    l.getEntityName().replace("\"", "\"\""),
                    l.getDetails().replace("\"", "\"\"")
            ));
        }

        byte[] bytes = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"pulseflow-audit-trail.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}
