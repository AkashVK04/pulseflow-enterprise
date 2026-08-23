package com.pulseflow.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeEntryDto {
    private String id;
    private String taskId;
    private String taskTitle;
    private String userId;
    private String userName;
    private BigDecimal hours;
    private String description;
    private String date;
    private String createdAt;
}
