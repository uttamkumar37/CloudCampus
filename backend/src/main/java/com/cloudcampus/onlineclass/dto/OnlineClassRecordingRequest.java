package com.cloudcampus.onlineclass.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OnlineClassRecordingRequest(
        @NotBlank
        @Size(max = 2048)
        String recordingUrl
) {}
