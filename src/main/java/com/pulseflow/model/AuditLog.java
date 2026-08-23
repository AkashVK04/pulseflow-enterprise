package com.pulseflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "actor_id", length = 50)
    private String actorId;

    @Column(name = "actor_name", nullable = false, length = 150)
    private String actorName;

    @Column(name = "actor_role", nullable = false, length = 100)
    private String actorRole;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    @Column(name = "entity_name", nullable = false, length = 255)
    private String entityName;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;
}
