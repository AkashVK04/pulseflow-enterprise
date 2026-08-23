package com.pulseflow.service;

import com.pulseflow.dto.GlobalSearchResultDto;
import com.pulseflow.dto.WorkspaceMetricsDto;
import com.pulseflow.model.Project;
import com.pulseflow.model.Task;
import com.pulseflow.repository.ProjectRepository;
import com.pulseflow.repository.TaskRepository;
import com.pulseflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class WorkspaceService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    public WorkspaceMetricsDto getMetrics() {
        List<Project> projects = projectRepository.findByIsDeletedFalse();
        List<Task> tasks = taskRepository.findByIsDeletedFalse();
        int usersCount = (int) userRepository.count();

        int totalProjects = projects.size();
        int activeProjects = (int) projects.stream().filter(p -> "Active".equalsIgnoreCase(p.getStatus())).count();

        int totalTasks = tasks.size();
        int completedTasks = (int) tasks.stream().filter(t -> "Completed".equalsIgnoreCase(t.getStatus())).count();
        int inProgressTasks = (int) tasks.stream().filter(t -> "In Progress".equalsIgnoreCase(t.getStatus())).count();
        int overdueTasks = (int) tasks.stream().filter(t -> "Critical".equalsIgnoreCase(t.getPriority()) || "High".equalsIgnoreCase(t.getPriority())).count();

        BigDecimal totalLoggedHours = tasks.stream()
                .map(t -> t.getLoggedHours() != null ? t.getLoggedHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal budgetHours = projects.stream()
                .map(p -> p.getBudgetHours() != null ? p.getBudgetHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return WorkspaceMetricsDto.builder()
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .inProgressTasks(inProgressTasks)
                .overdueTasks(overdueTasks)
                .totalLoggedHours(totalLoggedHours)
                .budgetHours(budgetHours.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.valueOf(2400) : budgetHours)
                .teamMembersCount(usersCount > 0 ? usersCount : 4)
                .build();
    }

    public List<GlobalSearchResultDto> globalSearch(String query) {
        List<GlobalSearchResultDto> results = new ArrayList<>();
        if (query == null || query.isBlank()) return results;

        String q = query.toLowerCase();

        // Search Projects
        projectRepository.findByIsDeletedFalse().stream()
                .filter(p -> p.getName().toLowerCase().contains(q) || p.getKey().toLowerCase().contains(q))
                .limit(5)
                .forEach(p -> results.add(GlobalSearchResultDto.builder()
                        .type("project")
                        .id(p.getId())
                        .title(p.getName())
                        .subtitle("Project Key: " + p.getKey())
                        .badge(p.getStatus())
                        .build()));

        // Search Tasks
        taskRepository.findByIsDeletedFalse().stream()
                .filter(t -> t.getTitle().toLowerCase().contains(q) || t.getKey().toLowerCase().contains(q))
                .limit(10)
                .forEach(t -> results.add(GlobalSearchResultDto.builder()
                        .type("task")
                        .id(t.getId())
                        .title(t.getKey() + ": " + t.getTitle())
                        .subtitle("Priority: " + t.getPriority() + " • Status: " + t.getStatus())
                        .badge(t.getPriority())
                        .build()));

        return results;
    }
}
