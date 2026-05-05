package com.cloudcampus.common.notification;

public interface NotificationService {
    void send(NotificationChannel channel, String destination, String subject, String message);
}

