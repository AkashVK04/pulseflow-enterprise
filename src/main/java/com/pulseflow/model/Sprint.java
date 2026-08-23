package com.pulseflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(name = "sprints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sprint {

    @Id
    @Column(length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String goal;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "total_points")
    @Builder.Default
    private Integer totalPoints = 0;

    @Column(name = "completed_points")
    @Builder.Default
    private Integer completedPoints = 0;

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private ZonedDateTime updatedAt;
}
