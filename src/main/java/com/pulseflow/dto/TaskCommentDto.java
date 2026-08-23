package com.pulseflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskCommentDto {
    private String id;
    private String taskId;
    private String authorId;
    private String authorName;
    private String authorAvatar;
    private String content;
    private String createdAt;
}
