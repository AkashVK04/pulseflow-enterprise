package com.pulseflow.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceMetricsDto {
    private Integer totalProjects;
    private Integer activeProjects;
    private Integer totalTasks;
    private Integer completedTasks;
    private Integer inProgressTasks;
    private Integer overdueTasks;
    private BigDecimal totalLoggedHours;
    private BigDecimal budgetHours;
    private Integer teamMembersCount;
}
