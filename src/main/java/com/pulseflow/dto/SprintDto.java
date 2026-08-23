package com.pulseflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintDto {
    private String id;
    private String projectId;
    private String name;
    private String goal;
    private String status;
    private String startDate;
    private String endDate;
    private Integer totalPoints;
    private Integer completedPoints;
}
