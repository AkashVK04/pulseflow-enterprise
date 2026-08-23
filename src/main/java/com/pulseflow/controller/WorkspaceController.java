package com.pulseflow.controller;

import com.pulseflow.dto.GlobalSearchResultDto;
import com.pulseflow.dto.UserDto;
import com.pulseflow.dto.WorkspaceMetricsDto;
import com.pulseflow.service.AuthService;
import com.pulseflow.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class WorkspaceController {

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private AuthService authService;

    @GetMapping("/workspaces/metrics")
    public ResponseEntity<WorkspaceMetricsDto> getMetrics() {
        return ResponseEntity.ok(workspaceService.getMetrics());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @GetMapping("/search")
    public ResponseEntity<List<GlobalSearchResultDto>> searchGlobal(@RequestParam(name = "q", required = false, defaultValue = "") String query) {
        return ResponseEntity.ok(workspaceService.globalSearch(query));
    }
}
