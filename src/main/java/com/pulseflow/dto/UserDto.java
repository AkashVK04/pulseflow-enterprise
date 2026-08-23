package com.pulseflow.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private String id;
    private String name;
    private String email;
    private String avatar;
    private String role;
    private String department;
    private Boolean accountLocked;
    private Integer failedLoginAttempts;
    private List<String> permissions;
}
