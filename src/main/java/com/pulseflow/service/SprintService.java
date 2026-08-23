package com.pulseflow.service;

import com.pulseflow.dto.SprintDto;
import com.pulseflow.model.Project;
import com.pulseflow.model.Sprint;
import com.pulseflow.repository.ProjectRepository;
import com.pulseflow.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<SprintDto> getSprints(String projectId) {
        List<Sprint> sprints = (projectId != null && !projectId.isBlank()) ?
                sprintRepository.findByProjectIdAndIsDeletedFalse(projectId) :
                sprintRepository.findByIsDeletedFalse();

        return sprints.stream().map(this::mapToDto).toList();
    }

    @Transactional
    public SprintDto createSprint(SprintDto request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Sprint sprint = Sprint.builder()
                .id("spr_" + UUID.randomUUID().toString().substring(0, 8))
                .project(project)
                .name(request.getName())
                .goal(request.getGoal() != null ? request.getGoal() : "")
                .status(request.getStatus() != null ? request.getStatus() : "Active")
                .startDate(request.getStartDate() != null ? LocalDate.parse(request.getStartDate()) : LocalDate.now())
                .endDate(request.getEndDate() != null ? LocalDate.parse(request.getEndDate()) : LocalDate.now().plusDays(14))
                .totalPoints(request.getTotalPoints() != null ? request.getTotalPoints() : 30)
                .completedPoints(0)
                .isDeleted(false)
                .build();

        Sprint saved = sprintRepository.save(sprint);

        auditLogService.logAction(
                "usr_1",
                "Sarah Connor",
                "Super Admin",
                "Sprint Planned",
                "Sprint",
                saved.getName(),
                "Created new sprint with " + saved.getTotalPoints() + " total story points."
        );

        return mapToDto(saved);
    }

    public SprintDto mapToDto(Sprint s) {
        return SprintDto.builder()
                .id(s.getId())
                .projectId(s.getProject() != null ? s.getProject().getId() : "proj_1")
                .name(s.getName())
                .goal(s.getGoal())
                .status(s.getStatus())
                .startDate(s.getStartDate() != null ? s.getStartDate().toString() : LocalDate.now().toString())
                .endDate(s.getEndDate() != null ? s.getEndDate().toString() : LocalDate.now().plusDays(14).toString())
                .totalPoints(s.getTotalPoints() != null ? s.getTotalPoints() : 30)
                .completedPoints(s.getCompletedPoints() != null ? s.getCompletedPoints() : 0)
                .build();
    }
}
