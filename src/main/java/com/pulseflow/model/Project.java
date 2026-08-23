package com.pulseflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, unique = true, length = 20)
    private String key;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(nullable = false, length = 50)
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id")
    private User lead;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "target_end_date", nullable = false)
    private LocalDate targetEndDate;

    @Column(name = "budget_hours", nullable = false)
    private BigDecimal budgetHours;

    @Column(name = "logged_hours", nullable = false)
    private BigDecimal loggedHours;

    @Column(name = "risk_level", nullable = false, length = 20)
    private String riskLevel;

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private ZonedDateTime updatedAt;
}
