package com.pulseflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeatureFlagDto {
    private String key;
    private String name;
    private String description;
    private Boolean enabled;
    private String category;
}
