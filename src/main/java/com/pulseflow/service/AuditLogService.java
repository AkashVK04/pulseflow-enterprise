package com.pulseflow.service;

import com.pulseflow.dto.AuditLogDto;
import com.pulseflow.model.AuditLog;
import com.pulseflow.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public List<AuditLogDto> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public void logAction(String actorId, String actorName, String actorRole,
                          String action, String entityType, String entityName, String details) {
        AuditLog log = AuditLog.builder()
                .id("log_" + UUID.randomUUID().toString().substring(0, 8))
                .actorId(actorId != null ? actorId : "usr_1")
                .actorName(actorName != null ? actorName : "Sarah Connor")
                .actorRole(actorRole != null ? actorRole : "Super Admin")
                .action(action)
                .entityType(entityType)
                .entityName(entityName)
                .details(details)
                .ipAddress("127.0.0.1")
                .build();

        auditLogRepository.save(log);
    }

    private AuditLogDto mapToDto(AuditLog log) {
        String formattedTime = log.getCreatedAt() != null ?
                log.getCreatedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME) :
                java.time.ZonedDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);

        return AuditLogDto.builder()
                .id(log.getId())
                .actorId(log.getActorId())
                .actorName(log.getActorName())
                .actorRole(log.getActorRole())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityName(log.getEntityName())
                .details(log.getDetails())
                .timestamp(formattedTime)
                .build();
    }
}
