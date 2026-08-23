package com.pulseflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(name = "time_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeEntry {

    @Id
    @Column(length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal hours;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;
}
