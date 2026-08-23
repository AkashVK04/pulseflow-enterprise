package com.pulseflow.repository;

import com.pulseflow.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    Optional<Project> findByKey(String key);
    List<Project> findByIsDeletedFalse();
}
