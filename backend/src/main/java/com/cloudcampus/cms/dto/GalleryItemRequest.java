package com.cloudcampus.cms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GalleryItemRequest {
    @NotBlank
    private String imageUrl;
    private String caption;
    private int displayOrder;
    private boolean visible = true;
}
