package com.pulseflow.service;

import com.pulseflow.config.JwtTokenProvider;
import com.pulseflow.dto.UserDto;
import com.pulseflow.model.Role;
import com.pulseflow.model.User;
import com.pulseflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        Role role = Role.builder().id("ROLE_SUPER_ADMIN").name("Super Admin").build();
        sampleUser = User.builder()
                .id("usr_1")
                .name("Sarah Connor")
                .email("sarah.connor@pulseflow.io")
                .role(role)
                .department("Executive Leadership")
                .accountNonLocked(true)
                .build();
    }

    @Test
    void testMapToUserDto() {
        UserDto dto = authService.mapToUserDto(sampleUser);
        assertNotNull(dto);
        assertEquals("usr_1", dto.getId());
        assertEquals("Sarah Connor", dto.getName());
        assertEquals("Super Admin", dto.getRole());
        assertFalse(dto.getAccountLocked());
    }

    @Test
    void testLoginSuccess() {
        when(userRepository.findByEmailIgnoreCase("sarah.connor@pulseflow.io")).thenReturn(Optional.of(sampleUser));
        when(tokenProvider.generateAccessToken(anyString(), anyString(), anyString())).thenReturn("mock_access_token");
        when(tokenProvider.generateRefreshToken(anyString())).thenReturn("mock_refresh_token");

        Map<String, Object> result = authService.login("sarah.connor@pulseflow.io", "Password123!");
        assertNotNull(result);
        assertEquals("mock_access_token", result.get("accessToken"));
        assertEquals("mock_refresh_token", result.get("refreshToken"));
        assertNotNull(result.get("user"));
    }

    @Test
    void testGetCurrentUserContext() {
        when(userRepository.findAll()).thenReturn(List.of(sampleUser));
        Map<String, Object> context = authService.getCurrentUserContext();
        assertNotNull(context);
        assertTrue(context.containsKey("user"));
        assertTrue(context.containsKey("allUsers"));
    }
}
