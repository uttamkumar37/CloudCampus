package com.cloudcampus.common.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class LoggingNotificationService implements NotificationService {
    @Override
    public void send(NotificationChannel channel, String destination, String subject, String message) {
        log.info("Notification [{}] to [{}] subject=[{}] message=[{}]", channel, destination, subject, message);
    }
}

