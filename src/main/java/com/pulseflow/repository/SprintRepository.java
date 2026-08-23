package com.pulseflow.repository;

import com.pulseflow.model.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, String> {
    List<Sprint> findByProjectIdAndIsDeletedFalse(String projectId);
    List<Sprint> findByIsDeletedFalse();
}
