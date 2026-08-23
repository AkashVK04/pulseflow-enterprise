package com.pulseflow.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIDecomposeResultDto {
    private String title;
    private String summary;
    private BigDecimal estimatedHours;
    private String recommendedPriority;
    private String recommendedRole;
    private List<AISubtaskItem> subtasks;
    private List<String> riskFactors;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AISubtaskItem {
        private String title;
        private BigDecimal estimatedHours;
    }
}
