package com.pulseflow.service;

import com.pulseflow.dto.ProjectDto;
import com.pulseflow.model.Project;
import com.pulseflow.model.User;
import com.pulseflow.repository.ProjectRepository;
import com.pulseflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ProjectService projectService;

    private Project sampleProject;
    private User sampleLead;

    @BeforeEach
    void setUp() {
        sampleLead = User.builder().id("usr_1").name("Sarah Connor").build();
        sampleProject = Project.builder()
                .id("proj_1")
                .key("SEC")
                .name("Cloud Security Architecture")
                .description("Security infrastructure")
                .status("Active")
                .category("Engineering")
                .lead(sampleLead)
                .startDate(LocalDate.now())
                .targetEndDate(LocalDate.now().plusDays(90))
                .budgetHours(BigDecimal.valueOf(600))
                .loggedHours(BigDecimal.valueOf(142.5))
                .riskLevel("Low")
                .isDeleted(false)
                .build();
    }

    @Test
    void testGetAllProjects() {
        when(projectRepository.findByIsDeletedFalse()).thenReturn(List.of(sampleProject));
        List<ProjectDto> projects = projectService.getAllProjects();
        assertEquals(1, projects.size());
        assertEquals("SEC", projects.get(0).getKey());
        assertEquals("Cloud Security Architecture", projects.get(0).getName());
    }

    @Test
    void testCreateProject() {
        ProjectDto request = ProjectDto.builder()
                .key("SEC")
                .name("Cloud Security Architecture")
                .category("Engineering")
                .budgetHours(BigDecimal.valueOf(600))
                .riskLevel("Low")
                .leadId("usr_1")
                .build();

        when(userRepository.findById("usr_1")).thenReturn(Optional.of(sampleLead));
        when(projectRepository.save(any(Project.class))).thenReturn(sampleProject);

        ProjectDto created = projectService.createProject(request);
        assertNotNull(created);
        assertEquals("SEC", created.getKey());
        assertEquals("Cloud Security Architecture", created.getName());
    }
}
