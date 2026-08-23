package com.pulseflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlobalSearchResultDto {
    private String type; // 'project' | 'task' | 'sprint' | 'user' | 'audit'
    private String id;
    private String title;
    private String subtitle;
    private String badge;
}
