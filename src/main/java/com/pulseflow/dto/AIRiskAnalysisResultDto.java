package com.pulseflow.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIRiskAnalysisResultDto {
    private Integer overallRiskScore;
    private String riskCategory;
    private String capacityWarning;
    private Integer timelineDelayEstimateDays;
    private List<String> keyVulnerabilities;
    private List<String> mitigationPlan;
}
