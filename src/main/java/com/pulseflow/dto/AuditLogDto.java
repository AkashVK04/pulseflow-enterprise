package com.pulseflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDto {
    private String id;
    private String actorId;
    private String actorName;
    private String actorRole;
    private String action;
    private String entityType;
    private String entityName;
    private String details;
    private String timestamp;
}
