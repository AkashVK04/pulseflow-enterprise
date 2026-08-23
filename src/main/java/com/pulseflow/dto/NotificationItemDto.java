package com.pulseflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationItemDto {
    private String id;
    private String title;
    private String message;
    private String type;
    private String timestamp;
    private Boolean read;
    private String link;
}
