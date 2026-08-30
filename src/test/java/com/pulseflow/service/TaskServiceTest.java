package com.pulseflow.service;

import com.pulseflow.dto.SubtaskDto;
import com.pulseflow.dto.TaskDto;
import com.pulseflow.model.Project;
import com.pulseflow.model.Task;
import com.pulseflow.model.User;
import com.pulseflow.repository.ProjectRepository;
import com.pulseflow.repository.TaskRepository;
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
public class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private TaskService taskService;

    private Project sampleProject;
    private User sampleUser;
    private Task sampleTask;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder().id("usr_1").name("Sarah Connor").build();
        sampleProject = Project.builder().id("proj_1").key("SEC").name("Cloud Security Architecture").build();
        sampleTask = Task.builder()
                .id("task_1")
                .key("SEC-101")
                .title("Implement OAuth2 Token Verification")
                .description("Setup JwtDecoder")
                .status("To Do")
                .priority("High")
                .project(sampleProject)
                .reporter(sampleUser)
                .assignee(sampleUser)
                .estimatedHours(BigDecimal.valueOf(16))
                .loggedHours(BigDecimal.ZERO)
                .dueDate(LocalDate.now().plusDays(7))
                .tags("[\"Security\",\"JWT\"]")
                .subtasks("[{\"id\":\"sub_1\",\"title\":\"Subtask 1\",\"completed\":false,\"estimatedHours\":4}]")
                .isDeleted(false)
                .build();
    }

    @Test
    void testGetTasks() {
        when(taskRepository.findByIsDeletedFalse()).thenReturn(List.of(sampleTask));
        List<TaskDto> tasks = taskService.getTasks("proj_1", null, null, null, null);
        assertEquals(1, tasks.size());
        assertEquals("SEC-101", tasks.get(0).getKey());
        assertEquals(2, tasks.get(0).getTags().size());
        assertEquals("Security", tasks.get(0).getTags().get(0));
        assertEquals(1, tasks.get(0).getSubtasks().size());
        assertEquals("Subtask 1", tasks.get(0).getSubtasks().get(0).getTitle());
    }

    @Test
    void testCreateTask() {
        TaskDto request = TaskDto.builder()
                .title("Implement OAuth2 Token Verification")
                .projectId("proj_1")
                .reporterId("usr_1")
                .assigneeId("usr_1")
                .tags(List.of("Security", "JWT"))
                .subtasks(List.of(SubtaskDto.builder().id("sub_1").title("Subtask 1").completed(false).estimatedHours(BigDecimal.valueOf(4)).build()))
                .build();

        when(projectRepository.findById("proj_1")).thenReturn(Optional.of(sampleProject));
        when(userRepository.findById("usr_1")).thenReturn(Optional.of(sampleUser));
        when(taskRepository.count()).thenReturn(100L);
        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        TaskDto created = taskService.createTask(request);
        assertNotNull(created);
        assertEquals("SEC-101", created.getKey());
        assertEquals(2, created.getTags().size());
        assertEquals(1, created.getSubtasks().size());
    }
}
