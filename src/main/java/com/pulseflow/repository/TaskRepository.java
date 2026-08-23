package com.pulseflow.repository;

import com.pulseflow.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    List<Task> findByProjectIdAndIsDeletedFalse(String projectId);
    List<Task> findByIsDeletedFalse();
    
    @Query("SELECT t FROM Task t WHERE t.isDeleted = false AND " +
           "(:projectId IS NULL OR t.project.id = :projectId) AND " +
           "(:sprintId IS NULL OR t.sprint.id = :sprintId) AND " +
           "(:assigneeId IS NULL OR t.assignee.id = :assigneeId)")
    List<Task> filterTasks(@Param("projectId") String projectId,
                           @Param("sprintId") String sprintId,
                           @Param("assigneeId") String assigneeId);
}
