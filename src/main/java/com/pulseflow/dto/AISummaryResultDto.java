package com.pulseflow.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AISummaryResultDto {
    private String headline;
    private String statusOverview;
    private List<String> keyAchievements;
    private List<String> blockersAndRisks;
    private List<String> recommendedActions;
}
