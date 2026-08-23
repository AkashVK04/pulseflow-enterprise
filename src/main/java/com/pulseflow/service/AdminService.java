package com.pulseflow.service;

import com.pulseflow.dto.BackgroundJobDto;
import com.pulseflow.dto.FeatureFlagDto;
import com.pulseflow.dto.UserDto;
import com.pulseflow.model.FeatureFlag;
import com.pulseflow.model.Role;
import com.pulseflow.model.User;
import com.pulseflow.repository.FeatureFlagRepository;
import com.pulseflow.repository.RoleRepository;
import com.pulseflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AdminService {

    @Autowired
    private FeatureFlagRepository featureFlagRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private AuditLogService auditLogService;

    public List<FeatureFlagDto> getFeatureFlags() {
        return featureFlagRepository.findAll().stream()
                .map(f -> FeatureFlagDto.builder()
                        .key(f.getFlagKey())
                        .name(f.getName())
                        .description(f.getDescription())
                        .enabled(f.getEnabled())
                        .category("AI")
                        .build())
                .toList();
    }

    @Transactional
    public Optional<FeatureFlagDto> toggleFeatureFlag(String key) {
        return featureFlagRepository.findById(key).map(flag -> {
            flag.setEnabled(!Boolean.TRUE.equals(flag.getEnabled()));
            FeatureFlag updated = featureFlagRepository.save(flag);

            auditLogService.logAction(
                    "usr_1",
                    "Sarah Connor",
                    "Super Admin",
                    "Feature Flag Toggled",
                    "User",
                    updated.getName(),
                    "Flag \"" + updated.getFlagKey() + "\" set to " + (updated.getEnabled() ? "ENABLED" : "DISABLED") + "."
            );

            return FeatureFlagDto.builder()
                    .key(updated.getFlagKey())
                    .name(updated.getName())
                    .description(updated.getDescription())
                    .enabled(updated.getEnabled())
                    .category("AI")
                    .build();
        });
    }

    public List<BackgroundJobDto> getBackgroundJobs() {
        return List.of(
                BackgroundJobDto.builder().id("job_1").name("Automated Gemini Risk Scanner").schedule("0 */15 * * * *").lastRun("12 mins ago").status("COMPLETED").durationMs(1420L).recordsProcessed(45).build(),
                BackgroundJobDto.builder().id("job_2").name("Daily Sprint Velocity Calculator").schedule("0 0 0 * * *").lastRun("4 hours ago").status("COMPLETED").durationMs(850L).recordsProcessed(12).build(),
                BackgroundJobDto.builder().id("job_3").name("Telemetry Index Optimizer").schedule("0 0 */6 * * *").lastRun("1 hour ago").status("IDLE").durationMs(3200L).recordsProcessed(1500).build()
        );
    }

    public BackgroundJobDto triggerBackgroundJob(String id) {
        auditLogService.logAction(
                "usr_1",
                "Sarah Connor",
                "Super Admin",
                "Background Job Manual Trigger",
                "User",
                "Job " + id,
                "Forced execution of background job [" + id + "]."
        );

        return BackgroundJobDto.builder()
                .id(id)
                .name("Manual Triggered Job " + id)
                .schedule("MANUAL")
                .lastRun("Just now")
                .status("COMPLETED")
                .durationMs(450L)
                .recordsProcessed(1)
                .build();
    }

    @Transactional
    public UserDto createUser(UserDto request) {
        Role role = roleRepository.findByName(request.getRole()).orElseGet(() ->
                roleRepository.findAll().stream().findFirst().orElse(null)
        );

        User user = User.builder()
                .id("usr_" + UUID.randomUUID().toString().substring(0, 8))
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash("$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym50CR6251MD.cpt34bAOO")
                .avatar(request.getAvatar() != null ? request.getAvatar() : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                .role(role)
                .department(request.getDepartment() != null ? request.getDepartment() : "Engineering")
                .accountNonLocked(true)
                .emailVerified(true)
                .isDeleted(false)
                .build();

        User saved = userRepository.save(user);

        auditLogService.logAction(
                "usr_1",
                "Sarah Connor",
                "Super Admin",
                "User Created",
                "User",
                saved.getName(),
                "Provisioned user with role \"" + (saved.getRole() != null ? saved.getRole().getName() : "Staff Contributor") + "\"."
        );

        return authService.mapToUserDto(saved);
    }

    @Transactional
    public Optional<UserDto> updateUserRole(String id, String roleName) {
        return userRepository.findById(id).map(user -> {
            roleRepository.findByName(roleName).ifPresent(user::setRole);
            User updated = userRepository.save(user);

            auditLogService.logAction(
                    "usr_1",
                    "Sarah Connor",
                    "Super Admin",
                    "User Role & Permissions Updated",
                    "User",
                    updated.getName(),
                    "Role updated to \"" + roleName + "\"."
            );

            return authService.mapToUserDto(updated);
        });
    }

    @Transactional
    public Optional<UserDto> toggleUserLock(String id) {
        return userRepository.findById(id).map(user -> {
            boolean current = Boolean.TRUE.equals(user.getAccountNonLocked());
            user.setAccountNonLocked(!current);
            User updated = userRepository.save(user);

            auditLogService.logAction(
                    "usr_1",
                    "Sarah Connor",
                    "Super Admin",
                    !current ? "Account Unlocked" : "Account Locked",
                    "User",
                    updated.getName(),
                    "Security status toggled. Locked: " + !current + "."
            );

            return authService.mapToUserDto(updated);
        });
    }
}
