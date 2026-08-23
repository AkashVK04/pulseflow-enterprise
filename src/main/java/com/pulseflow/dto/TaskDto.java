package com.pulseflow.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDto {
    private String id;
    private String key;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String projectId;
    private String sprintId;
    private String assigneeId;
    private String assigneeName;
    private String assigneeAvatar;
    private String reporterId;
    private BigDecimal estimatedHours;
    private BigDecimal loggedHours;
    private String dueDate;
    private List<String> tags;
    private List<SubtaskDto> subtasks;
    private String createdAt;
    private String updatedAt;
}
