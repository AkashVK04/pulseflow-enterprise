package com.pulseflow.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubtaskDto {
    private String id;
    private String title;
    private Boolean completed;
    private BigDecimal estimatedHours;
}
