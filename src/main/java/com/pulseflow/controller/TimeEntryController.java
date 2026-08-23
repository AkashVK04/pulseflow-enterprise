package com.pulseflow.controller;

import com.pulseflow.dto.TimeEntryDto;
import com.pulseflow.service.TimeEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/time-entries")
public class TimeEntryController {

    @Autowired
    private TimeEntryService timeEntryService;

    @GetMapping
    public ResponseEntity<List<TimeEntryDto>> getTimeEntries(@RequestParam(required = false) String taskId) {
        return ResponseEntity.ok(timeEntryService.getTimeEntries(taskId));
    }

    @PostMapping
    public ResponseEntity<TimeEntryDto> addTimeEntry(@RequestBody Map<String, Object> body) {
        String taskId = (String) body.get("taskId");
        String userId = (String) body.get("userId");
        String description = (String) body.get("description");
        String date = (String) body.get("date");
        Object hoursObj = body.get("hours");

        if (taskId == null || hoursObj == null) {
            return ResponseEntity.badRequest().build();
        }

        BigDecimal hours = new BigDecimal(hoursObj.toString());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(timeEntryService.addTimeEntry(taskId, userId, hours, description, date));
    }
}
