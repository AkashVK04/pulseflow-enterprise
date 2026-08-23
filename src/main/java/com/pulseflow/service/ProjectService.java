package com.pulseflow.service;

import com.pulseflow.dto.ProjectDto;
import com.pulseflow.model.Project;
import com.pulseflow.model.User;
import com.pulseflow.repository.ProjectRepository;
import com.pulseflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<ProjectDto> getAllProjects() {
        return projectRepository.findByIsDeletedFalse().stream()
                .map(this::mapToDto)
                .toList();
    }

    public Optional<ProjectDto> getProjectById(String id) {
        return projectRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .map(this::mapToDto);
    }

    @Transactional
    public ProjectDto createProject(ProjectDto request) {
        String leadId = request.getLeadId() != null ? request.getLeadId() : "usr_1";
        User lead = userRepository.findById(leadId).orElse(null);

        Project project = Project.builder()
                .id("proj_" + UUID.randomUUID().toString().substring(0, 8))
                .key(request.getKey().toUpperCase())
                .name(request.getName())
                .description(request.getDescription() != null ? request.getDescription() : "")
                .status(request.getStatus() != null ? request.getStatus() : "Active")
                .category(request.getCategory() != null ? request.getCategory() : "Engineering")
                .lead(lead)
                .startDate(request.getStartDate() != null ? LocalDate.parse(request.getStartDate()) : LocalDate.now())
                .targetEndDate(request.getTargetEndDate() != null ? LocalDate.parse(request.getTargetEndDate()) : LocalDate.now().plusDays(90))
                .budgetHours(request.getBudgetHours() != null ? request.getBudgetHours() : BigDecimal.valueOf(500))
                .loggedHours(BigDecimal.ZERO)
                .riskLevel(request.getRiskLevel() != null ? request.getRiskLevel() : "Low")
                .isDeleted(false)
                .build();

        Project saved = projectRepository.save(project);

        auditLogService.logAction(
                leadId,
                lead != null ? lead.getName() : "Sarah Connor",
                "Super Admin",
                "Project Created",
                "Project",
                saved.getName(),
                "Created new project [" + saved.getKey() + "] with budget of " + saved.getBudgetHours() + " hours."
        );

        return mapToDto(saved);
    }

    @Transactional
    public Optional<ProjectDto> updateProject(String id, ProjectDto request) {
        return projectRepository.findById(id).map(existing -> {
            if (request.getName() != null) existing.setName(request.getName());
            if (request.getDescription() != null) existing.setDescription(request.getDescription());
            if (request.getStatus() != null) existing.setStatus(request.getStatus());
            if (request.getCategory() != null) existing.setCategory(request.getCategory());
            if (request.getRiskLevel() != null) existing.setRiskLevel(request.getRiskLevel());
            if (request.getBudgetHours() != null) existing.setBudgetHours(request.getBudgetHours());

            Project updated = projectRepository.save(existing);

            auditLogService.logAction(
                    "usr_1",
                    "Sarah Connor",
                    "Super Admin",
                    "Project Updated",
                    "Project",
                    updated.getName(),
                    "Updated project status to " + updated.getStatus() + " and risk level to " + updated.getRiskLevel() + "."
            );

            return mapToDto(updated);
        });
    }

    public ProjectDto mapToDto(Project p) {
        return ProjectDto.builder()
                .id(p.getId())
                .key(p.getKey())
                .name(p.getName())
                .description(p.getDescription())
                .status(p.getStatus())
                .category(p.getCategory())
                .leadId(p.getLead() != null ? p.getLead().getId() : "usr_1")
                .leadName(p.getLead() != null ? p.getLead().getName() : "Sarah Connor")
                .startDate(p.getStartDate() != null ? p.getStartDate().toString() : LocalDate.now().toString())
                .targetEndDate(p.getTargetEndDate() != null ? p.getTargetEndDate().toString() : LocalDate.now().plusDays(90).toString())
                .budgetHours(p.getBudgetHours() != null ? p.getBudgetHours() : BigDecimal.valueOf(500))
                .loggedHours(p.getLoggedHours() != null ? p.getLoggedHours() : BigDecimal.ZERO)
                .membersCount(5)
                .riskLevel(p.getRiskLevel() != null ? p.getRiskLevel() : "Low")
                .build();
    }
}
