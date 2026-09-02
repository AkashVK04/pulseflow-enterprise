package com.pulseflow.security;

import com.pulseflow.config.JwtTokenProvider;
import com.pulseflow.dto.ProjectDto;
import com.pulseflow.dto.TaskDto;

import com.pulseflow.model.Role;
import com.pulseflow.model.User;
import com.pulseflow.repository.UserRepository;
import com.pulseflow.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityRbacTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private ProjectService projectService;

    @MockBean
    private TaskService taskService;

    @MockBean
    private AdminService adminService;

    @MockBean
    private GeminiAiService geminiAiService;

    @MockBean
    private AuditLogService auditLogService;

    private String superAdminToken;
    private String pmToken;
    private String staffToken;
    private String guestToken;

    @BeforeEach
    void setUp() {
        Role superAdminRole = Role.builder().id("ROLE_SUPER_ADMIN").name("Super Admin").build();
        User superAdmin = User.builder().id("usr_1").email("sarah.connor@pulseflow.io").role(superAdminRole).build();

        Role pmRole = Role.builder().id("ROLE_PM").name("Project Manager").build();
        User pm = User.builder().id("usr_2").email("alex.rivera@pulseflow.io").role(pmRole).build();

        Role staffRole = Role.builder().id("ROLE_STAFF").name("Staff Contributor").build();
        User staff = User.builder().id("usr_4").email("elena.rostova@pulseflow.io").role(staffRole).build();

        Role guestRole = Role.builder().id("ROLE_GUEST").name("Guest").build();
        User guest = User.builder().id("usr_5").email("guest@pulseflow.io").role(guestRole).build();

        when(userRepository.findById("usr_1")).thenReturn(Optional.of(superAdmin));
        when(userRepository.findById("usr_2")).thenReturn(Optional.of(pm));
        when(userRepository.findById("usr_4")).thenReturn(Optional.of(staff));
        when(userRepository.findById("usr_5")).thenReturn(Optional.of(guest));

        superAdminToken = tokenProvider.generateAccessToken("usr_1", "sarah.connor@pulseflow.io", "ROLE_SUPER_ADMIN");
        pmToken = tokenProvider.generateAccessToken("usr_2", "alex.rivera@pulseflow.io", "ROLE_PM");
        staffToken = tokenProvider.generateAccessToken("usr_4", "elena.rostova@pulseflow.io", "ROLE_STAFF");
        guestToken = tokenProvider.generateAccessToken("usr_5", "guest@pulseflow.io", "ROLE_GUEST");
    }

    @Test
    void testNoTokenGetProjectsReturns401() throws Exception {
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testNoTokenGetAdminFeatureFlagsReturns401() throws Exception {
        mockMvc.perform(get("/api/admin/feature-flags"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testNoTokenGetApiDocsReturns200() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk());
    }

    @Test
    void testNoTokenGetSwaggerUiHtmlReturns3xx() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    void testStaffGetProjectsReturns200() throws Exception {
        when(projectService.getAllProjects()).thenReturn(List.of());
        mockMvc.perform(get("/api/projects")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk());
    }

    @Test
    void testStaffDeleteTaskReturns403() throws Exception {
        mockMvc.perform(delete("/api/tasks/task_1")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testStaffCreateAdminUserReturns403() throws Exception {
        mockMvc.perform(post("/api/admin/users")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test\",\"email\":\"test@pulseflow.io\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testSuperAdminCreateAdminUserReturns201() throws Exception {
        mockMvc.perform(post("/api/admin/users")
                        .header("Authorization", "Bearer " + superAdminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test\",\"email\":\"test@pulseflow.io\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void testPmCreateProjectReturns201() throws Exception {
        when(projectService.createProject(any())).thenReturn(ProjectDto.builder().id("proj_new").key("NEW").name("New Proj").build());
        mockMvc.perform(post("/api/projects")
                        .header("Authorization", "Bearer " + pmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"key\":\"NEW\",\"name\":\"New Proj\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void testPmDeleteTaskReturns200() throws Exception {
        when(taskService.deleteTask("task_1")).thenReturn(true);
        mockMvc.perform(delete("/api/tasks/task_1")
                        .header("Authorization", "Bearer " + pmToken))
                .andExpect(status().isOk());
    }

    @Test
    void testGuestGetProjectsReturns200() throws Exception {
        when(projectService.getAllProjects()).thenReturn(List.of());
        mockMvc.perform(get("/api/projects")
                        .header("Authorization", "Bearer " + guestToken))
                .andExpect(status().isOk());
    }

    @Test
    void testGuestCreateTaskReturns403() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + guestToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Task 1\",\"projectId\":\"proj_1\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAuthenticatedAiChatReturns200() throws Exception {
        when(geminiAiService.generateContent(anyString())).thenReturn("AI response");
        mockMvc.perform(post("/api/ai/chat")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"query\":\"Sprint status\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void testUnauthenticatedAiChatReturns401() throws Exception {
        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"query\":\"Sprint status\"}"))
                .andExpect(status().isUnauthorized());
    }
}
