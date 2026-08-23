package com.pulseflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackgroundJobDto {
    private String id;
    private String name;
    private String schedule;
    private String lastRun;
    private String status;
    private Long durationMs;
    private Integer recordsProcessed;
}
