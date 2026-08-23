package com.pulseflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "feature_flags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeatureFlag {

    @Id
    @Column(name = "flag_key", length = 100)
    private String flagKey;

    @Column(nullable = false, length = 150)
    private String name;

    @Builder.Default
    private Boolean enabled = true;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private ZonedDateTime updatedAt;
}
