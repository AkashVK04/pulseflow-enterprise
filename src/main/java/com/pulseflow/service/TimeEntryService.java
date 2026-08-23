package com.pulseflow.service;

import com.pulseflow.dto.TimeEntryDto;
import com.pulseflow.model.Task;
import com.pulseflow.model.TimeEntry;
import com.pulseflow.model.User;
import com.pulseflow.repository.TaskRepository;
import com.pulseflow.repository.TimeEntryRepository;
import com.pulseflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class TimeEntryService {

    @Autowired
    private TimeEntryRepository timeEntryRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<TimeEntryDto> getTimeEntries(String taskId) {
        List<TimeEntry> entries = (taskId != null && !taskId.isBlank()) ?
                timeEntryRepository.findByTaskIdOrderByCreatedAtDesc(taskId) :
                timeEntryRepository.findAllByOrderByCreatedAtDesc();

        return entries.stream().map(this::mapToDto).toList();
    }

    @Transactional
    public TimeEntryDto addTimeEntry(String taskId, String userId, BigDecimal hours, String description, String workDateStr) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User user = userRepository.findById(userId != null ? userId : "usr_1")
                .orElseGet(() -> userRepository.findAll().get(0));

        LocalDate workDate = (workDateStr != null && !workDateStr.isBlank()) ?
                LocalDate.parse(workDateStr) : LocalDate.now();

        TimeEntry entry = TimeEntry.builder()
                .id("te_" + UUID.randomUUID().toString().substring(0, 8))
                .task(task)
                .user(user)
                .hours(hours)
                .description(description != null ? description : "Work logged on task")
                .workDate(workDate)
                .build();

        TimeEntry saved = timeEntryRepository.save(entry);

        // Update task logged hours
        BigDecimal newLoggedHours = (task.getLoggedHours() != null ? task.getLoggedHours() : BigDecimal.ZERO).add(hours);
        task.setLoggedHours(newLoggedHours);
        taskRepository.save(task);

        // Update project logged hours
        if (task.getProject() != null) {
            BigDecimal projLogged = (task.getProject().getLoggedHours() != null ? task.getProject().getLoggedHours() : BigDecimal.ZERO).add(hours);
            task.getProject().setLoggedHours(projLogged);
        }

        auditLogService.logAction(
                user.getId(),
                user.getName(),
                "Staff Contributor",
                "Time Logged",
                "Task",
                task.getKey() + ": " + task.getTitle(),
                "Logged " + hours + " hrs. Note: \"" + saved.getDescription() + "\"."
        );

        return mapToDto(saved);
    }

    public TimeEntryDto mapToDto(TimeEntry te) {
        String formattedTime = te.getCreatedAt() != null ? te.getCreatedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME) : java.time.ZonedDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);

        return TimeEntryDto.builder()
                .id(te.getId())
                .taskId(te.getTask() != null ? te.getTask().getId() : "")
                .taskTitle(te.getTask() != null ? te.getTask().getTitle() : "")
                .userId(te.getUser() != null ? te.getUser().getId() : "usr_1")
                .userName(te.getUser() != null ? te.getUser().getName() : "Sarah Connor")
                .hours(te.getHours())
                .description(te.getDescription())
                .date(te.getWorkDate() != null ? te.getWorkDate().toString() : LocalDate.now().toString())
                .createdAt(formattedTime)
                .build();
    }
}
