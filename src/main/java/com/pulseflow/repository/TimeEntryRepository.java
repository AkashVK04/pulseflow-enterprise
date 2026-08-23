package com.pulseflow.repository;

import com.pulseflow.model.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, String> {
    List<TimeEntry> findByTaskIdOrderByCreatedAtDesc(String taskId);
    List<TimeEntry> findByUserIdOrderByCreatedAtDesc(String userId);
    List<TimeEntry> findAllByOrderByCreatedAtDesc();
}
