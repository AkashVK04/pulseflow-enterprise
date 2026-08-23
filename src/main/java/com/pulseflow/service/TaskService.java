package com.pulseflow.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulseflow.dto.SubtaskDto;
import com.pulseflow.dto.TaskCommentDto;
import com.pulseflow.dto.TaskDto;
import com.pulseflow.model.*;
import com.pulseflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskCommentRepository taskCommentRepository;

    @Autowired
    private AuditLogService auditLogService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<TaskDto> getTasks(String projectId, String sprintId, String assigneeId, String status, String search) {
        List<Task> tasks = taskRepository.findByIsDeletedFalse();

        return tasks.stream()
                .filter(t -> {
                    if (projectId != null && !projectId.isBlank() && !projectId.equalsIgnoreCase("ALL") && !projectId.equals(t.getProject().getId())) return false;
                    if (sprintId != null && !sprintId.isBlank() && (t.getSprint() == null || !sprintId.equals(t.getSprint().getId()))) return false;
                    if (assigneeId != null && !assigneeId.isBlank() && (t.getAssignee() == null || !assigneeId.equals(t.getAssignee().getId()))) return false;
                    if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL") && !status.equalsIgnoreCase(t.getStatus())) return false;
                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase();
                        return t.getTitle().toLowerCase().contains(q) ||
                                t.getKey().toLowerCase().contains(q) ||
                                (t.getDescription() != null && t.getDescription().toLowerCase().contains(q));
                    }
                    return true;
                })
                .map(this::mapToDto)
                .toList();
    }

    public Optional<TaskDto> getTaskById(String id) {
        return taskRepository.findById(id)
                .filter(t -> !Boolean.TRUE.equals(t.getIsDeleted()))
                .map(this::mapToDto);
    }

    @Transactional
    public TaskDto createTask(TaskDto request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found: " + request.getProjectId()));

        Sprint sprint = request.getSprintId() != null ? sprintRepository.findById(request.getSprintId()).orElse(null) : null;
        User assignee = request.getAssigneeId() != null ? userRepository.findById(request.getAssigneeId()).orElse(null) : null;
        User reporter = request.getReporterId() != null ? userRepository.findById(request.getReporterId()).orElseGet(() -> userRepository.findAll().get(0)) : userRepository.findAll().get(0);

        long taskCount = taskRepository.count() + 101;
        String taskKey = project.getKey() + "-" + taskCount;

        String tagsJson = "[]";
        String subtasksJson = "[]";
        try {
            if (request.getTags() != null) tagsJson = objectMapper.writeValueAsString(request.getTags());
            if (request.getSubtasks() != null) subtasksJson = objectMapper.writeValueAsString(request.getSubtasks());
        } catch (Exception e) {
            tagsJson = "[\"General\"]";
        }

        Task task = Task.builder()
                .id("task_" + UUID.randomUUID().toString().substring(0, 8))
                .key(taskKey)
                .title(request.getTitle())
                .description(request.getDescription() != null ? request.getDescription() : "")
                .status(request.getStatus() != null ? request.getStatus() : "To Do")
                .priority(request.getPriority() != null ? request.getPriority() : "Medium")
                .project(project)
                .sprint(sprint)
                .assignee(assignee)
                .reporter(reporter)
                .estimatedHours(request.getEstimatedHours() != null ? request.getEstimatedHours() : BigDecimal.valueOf(8))
                .loggedHours(BigDecimal.ZERO)
                .dueDate(request.getDueDate() != null ? LocalDate.parse(request.getDueDate()) : LocalDate.now().plusDays(7))
                .tags(tagsJson)
                .subtasks(subtasksJson)
                .isDeleted(false)
                .build();

        Task saved = taskRepository.save(task);

        auditLogService.logAction(
                reporter.getId(),
                reporter.getName(),
                "Super Admin",
                "Task Created",
                "Task",
                saved.getKey() + ": " + saved.getTitle(),
                "Created task with priority " + saved.getPriority() + "."
        );

        return mapToDto(saved);
    }

    @Transactional
    public Optional<TaskDto> updateTask(String id, TaskDto request) {
        return taskRepository.findById(id).map(existing -> {
            if (request.getTitle() != null) existing.setTitle(request.getTitle());
            if (request.getDescription() != null) existing.setDescription(request.getDescription());
            if (request.getStatus() != null) existing.setStatus(request.getStatus());
            if (request.getPriority() != null) existing.setPriority(request.getPriority());
            if (request.getEstimatedHours() != null) existing.setEstimatedHours(request.getEstimatedHours());
            if (request.getLoggedHours() != null) existing.setLoggedHours(request.getLoggedHours());
            if (request.getDueDate() != null) existing.setDueDate(LocalDate.parse(request.getDueDate()));

            if (request.getAssigneeId() != null) {
                userRepository.findById(request.getAssigneeId()).ifPresent(existing::setAssignee);
            }

            if (request.getSprintId() != null) {
                sprintRepository.findById(request.getSprintId()).ifPresent(existing::setSprint);
            }

            if (request.getTags() != null) {
                try { existing.setTags(objectMapper.writeValueAsString(request.getTags())); } catch (Exception ignored) {}
            }

            if (request.getSubtasks() != null) {
                try { existing.setSubtasks(objectMapper.writeValueAsString(request.getSubtasks())); } catch (Exception ignored) {}
            }

            Task updated = taskRepository.save(existing);

            auditLogService.logAction(
                    "usr_1",
                    "Sarah Connor",
                    "Super Admin",
                    "Task Updated",
                    "Task",
                    updated.getKey() + ": " + updated.getTitle(),
                    "Status changed to \"" + updated.getStatus() + "\", priority: \"" + updated.getPriority() + "\"."
            );

            return mapToDto(updated);
        });
    }

    @Transactional
    public boolean deleteTask(String id) {
        return taskRepository.findById(id).map(task -> {
            task.setIsDeleted(true);
            taskRepository.save(task);

            auditLogService.logAction(
                    "usr_1",
                    "Sarah Connor",
                    "Super Admin",
                    "Task Deleted",
                    "Task",
                    task.getKey() + ": " + task.getTitle(),
                    "Task removed from project backlog."
            );

            return true;
        }).orElse(false);
    }

    public List<TaskCommentDto> getTaskComments(String taskId) {
        return taskCommentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(this::mapCommentToDto)
                .toList();
    }

    @Transactional
    public TaskCommentDto addComment(String taskId, String content, String authorId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User author = userRepository.findById(authorId != null ? authorId : "usr_1")
                .orElseGet(() -> userRepository.findAll().get(0));

        TaskComment comment = TaskComment.builder()
                .id("cm_" + UUID.randomUUID().toString().substring(0, 8))
                .task(task)
                .author(author)
                .content(content)
                .build();

        TaskComment saved = taskCommentRepository.save(comment);
        return mapCommentToDto(saved);
    }

    public TaskDto mapToDto(Task t) {
        List<String> tags = new ArrayList<>();
        List<SubtaskDto> subtasks = new ArrayList<>();

        try {
            if (t.getTags() != null) {
                tags = objectMapper.readValue(t.getTags(), new TypeReference<List<String>>() {});
            }
            if (t.getSubtasks() != null) {
                subtasks = objectMapper.readValue(t.getSubtasks(), new TypeReference<List<SubtaskDto>>() {});
            }
        } catch (Exception ignored) {}

        String createdAtStr = t.getCreatedAt() != null ? t.getCreatedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME) : java.time.ZonedDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        String updatedAtStr = t.getUpdatedAt() != null ? t.getUpdatedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME) : java.time.ZonedDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);

        return TaskDto.builder()
                .id(t.getId())
                .key(t.getKey())
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus())
                .priority(t.getPriority())
                .projectId(t.getProject() != null ? t.getProject().getId() : "proj_1")
                .sprintId(t.getSprint() != null ? t.getSprint().getId() : null)
                .assigneeId(t.getAssignee() != null ? t.getAssignee().getId() : null)
                .assigneeName(t.getAssignee() != null ? t.getAssignee().getName() : "UNASSIGNED")
                .assigneeAvatar(t.getAssignee() != null ? t.getAssignee().getAvatar() : null)
                .reporterId(t.getReporter() != null ? t.getReporter().getId() : "usr_1")
                .estimatedHours(t.getEstimatedHours() != null ? t.getEstimatedHours() : BigDecimal.valueOf(8))
                .loggedHours(t.getLoggedHours() != null ? t.getLoggedHours() : BigDecimal.ZERO)
                .dueDate(t.getDueDate() != null ? t.getDueDate().toString() : LocalDate.now().plusDays(7).toString())
                .tags(tags)
                .subtasks(subtasks)
                .createdAt(createdAtStr)
                .updatedAt(updatedAtStr)
                .build();
    }

    private TaskCommentDto mapCommentToDto(TaskComment c) {
        String formattedTime = c.getCreatedAt() != null ? c.getCreatedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME) : java.time.ZonedDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        return TaskCommentDto.builder()
                .id(c.getId())
                .taskId(c.getTask() != null ? c.getTask().getId() : "")
                .authorId(c.getAuthor() != null ? c.getAuthor().getId() : "usr_1")
                .authorName(c.getAuthor() != null ? c.getAuthor().getName() : "Sarah Connor")
                .authorAvatar(c.getAuthor() != null ? c.getAuthor().getAvatar() : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                .content(c.getContent())
                .createdAt(formattedTime)
                .build();
    }
}
