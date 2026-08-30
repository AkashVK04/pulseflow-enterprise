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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

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
    private PasswordEncoder passwordEncoder;

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
                .passwordHash("$2a$10$JHcRevs8kY35rO2tF6YCv.w11sjS6BWcY8lMfd5Ngmu0mNe9LtRCu")
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
        when(passwordEncoder.matches("Password123!", sampleUser.getPasswordHash())).thenReturn(true);
        when(tokenProvider.generateAccessToken(anyString(), anyString(), anyString())).thenReturn("mock_access_token");
        when(tokenProvider.generateRefreshToken(anyString())).thenReturn("mock_refresh_token");

        Map<String, Object> result = authService.login("sarah.connor@pulseflow.io", "Password123!");
        assertNotNull(result);
        assertEquals("mock_access_token", result.get("accessToken"));
        assertEquals("mock_refresh_token", result.get("refreshToken"));
        assertNotNull(result.get("user"));
    }

    @Test
    void testLoginInvalidPasswordThrows401() {
        when(userRepository.findByEmailIgnoreCase("sarah.connor@pulseflow.io")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword", sampleUser.getPasswordHash())).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> {
            authService.login("sarah.connor@pulseflow.io", "WrongPassword");
        });
    }

    @Test
    void testLoginUnknownUserThrows401() {
        when(userRepository.findByEmailIgnoreCase("unknown@pulseflow.io")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            authService.login("unknown@pulseflow.io", "Password123!");
        });
    }

    @Test
    void testGetCurrentUserContext() {
        Authentication auth = new UsernamePasswordAuthenticationToken(sampleUser, null, List.of());
        when(userRepository.findAll()).thenReturn(List.of(sampleUser));

        Map<String, Object> context = authService.getCurrentUserContext(auth);
        assertNotNull(context);
        assertTrue(context.containsKey("user"));
        assertTrue(context.containsKey("allUsers"));
        assertEquals("usr_1", ((UserDto) context.get("user")).getId());
    }

    @Test
    void testBcryptSeedHashMatchesPassword123() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        assertTrue(encoder.matches("Password123!", "$2a$10$JHcRevs8kY35rO2tF6YCv.w11sjS6BWcY8lMfd5Ngmu0mNe9LtRCu"), "Seed password hash must match Password123!");
    }
}
