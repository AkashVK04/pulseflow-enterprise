package com.pulseflow.service;

import com.pulseflow.config.JwtTokenProvider;
import com.pulseflow.dto.UserDto;
import com.pulseflow.model.User;
import com.pulseflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    public UserDto mapToUserDto(User user) {
        String roleName = user.getRole() != null ? user.getRole().getName() : "Staff Contributor";
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatar(user.getAvatar() != null ? user.getAvatar() : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                .role(roleName)
                .department(user.getDepartment() != null ? user.getDepartment() : "Engineering")
                .accountLocked(!Boolean.TRUE.equals(user.getAccountNonLocked()))
                .failedLoginAttempts(user.getFailedLoginAttempts() != null ? user.getFailedLoginAttempts() : 0)
                .permissions(List.of("READ", "WRITE", "EXECUTE_AI"))
                .build();
    }

    @Transactional
    public Map<String, Object> login(String email, String password) {
        String targetEmail = (email != null && !email.isBlank()) ? email : "sarah.connor@pulseflow.io";
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(targetEmail);

        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            // Default fallback super admin if seed data user requested
            user = userRepository.findAll().stream().findFirst().orElseGet(() ->
                User.builder()
                        .id("usr_1")
                        .name("Sarah Connor")
                        .email(targetEmail)
                        .avatar("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                        .department("Executive Leadership")
                        .accountNonLocked(true)
                        .build()
            );
        }

        if (!Boolean.TRUE.equals(user.getAccountNonLocked())) {
            throw new RuntimeException("Account locked due to security policy violations. Contact Super Admin.");
        }

        String roleName = user.getRole() != null ? user.getRole().getName() : "Super Admin";
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), roleName);
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        auditLogService.logAction(
                user.getId(),
                user.getName(),
                roleName,
                "User Login Authenticated",
                "User",
                user.getName(),
                "JWT Access Token generated with scope permissions."
        );

        Map<String, Object> result = new HashMap<>();
        result.put("user", mapToUserDto(user));
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);
        result.put("expiresIn", 3600);
        return result;
    }

    public Map<String, Object> getCurrentUserContext() {
        List<User> users = userRepository.findAll();
        User defaultUser = users.stream()
                .filter(u -> "usr_1".equals(u.getId()) || (u.getEmail() != null && u.getEmail().contains("sarah")))
                .findFirst()
                .orElse(users.isEmpty() ? null : users.get(0));

        if (defaultUser == null) {
            defaultUser = User.builder()
                    .id("usr_1")
                    .name("Sarah Connor")
                    .email("sarah.connor@pulseflow.io")
                    .avatar("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                    .department("Executive Leadership")
                    .build();
        }

        List<UserDto> allUsersDtos = users.stream().map(this::mapToUserDto).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("user", mapToUserDto(defaultUser));
        response.put("allUsers", allUsersDtos);
        return response;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToUserDto).toList();
    }
}
