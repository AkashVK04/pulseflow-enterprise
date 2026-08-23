package com.pulseflow.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDto {
    private String id;
    private String key;
    private String name;
    private String description;
    private String status;
    private String category;
    private String leadId;
    private String leadName;
    private String startDate;
    private String targetEndDate;
    private BigDecimal budgetHours;
    private BigDecimal loggedHours;
    private Integer membersCount;
    private String riskLevel;
}
