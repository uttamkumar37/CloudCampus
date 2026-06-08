package com.cloudcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CloudCampusApplication {

    public static void main(String[] args) {
        SpringApplication.run(CloudCampusApplication.class, args);
    }
}
