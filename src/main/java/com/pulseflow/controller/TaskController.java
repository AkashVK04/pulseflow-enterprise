package com.pulseflow.controller;

import com.pulseflow.dto.TaskCommentDto;
import com.pulseflow.dto.TaskDto;
import com.pulseflow.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TaskDto>> getTasks(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String sprintId,
            @RequestParam(required = false) String assigneeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(taskService.getTasks(projectId, sprintId, assigneeId, status, search));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable String id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_PM', 'ROLE_SENIOR_ENG', 'ROLE_STAFF')")
    public ResponseEntity<TaskDto> createTask(@RequestBody TaskDto request) {
        if (request.getTitle() == null || request.getProjectId() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_PM', 'ROLE_SENIOR_ENG', 'ROLE_STAFF')")
    public ResponseEntity<TaskDto> updateTask(@PathVariable String id, @RequestBody TaskDto request) {
        return taskService.updateTask(id, request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_PM')")
    public ResponseEntity<?> deleteTask(@PathVariable String id) {
        boolean success = taskService.deleteTask(id);
        if (!success) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(java.util.Map.of("message", "Task deleted successfully"));
    }

    @GetMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TaskCommentDto>> getComments(@PathVariable String id) {
        return ResponseEntity.ok(taskService.getTaskComments(id));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_WORKSPACE_ADMIN', 'ROLE_PM', 'ROLE_SENIOR_ENG', 'ROLE_STAFF')")
    public ResponseEntity<TaskCommentDto> addComment(
            @PathVariable String id,
            @RequestBody java.util.Map<String, String> body
    ) {
        String content = body.get("content");
        String authorId = body.get("authorId");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.addComment(id, content, authorId));
    }
}
