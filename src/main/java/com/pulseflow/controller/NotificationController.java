package com.pulseflow.controller;

import com.pulseflow.dto.NotificationItemDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @GetMapping
    public ResponseEntity<List<NotificationItemDto>> getNotifications() {
        List<NotificationItemDto> items = List.of(
                NotificationItemDto.builder().id("notif_1").title("Security Vulnerability Scan Completed").message("0 critical CVEs detected in recent IAM sprint build.").type("success").timestamp("12m ago").read(false).link("/audit").build(),
                NotificationItemDto.builder().id("notif_2").title("Overdue Sprint Work Item Alert").message("Task SEC-102 target due date is approaching in 48 hours.").type("warning").timestamp("1h ago").read(false).link("/kanban").build(),
                NotificationItemDto.builder().id("notif_3").title("New Time Log Submitted").message("Marcus Vance logged 8 hours on task SEC-101.").type("info").timestamp("3h ago").read(true).link("/time").build()
        );
        return ResponseEntity.ok(items);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Boolean>> markAllRead() {
        return ResponseEntity.ok(Map.of("success", true));
    }
}
