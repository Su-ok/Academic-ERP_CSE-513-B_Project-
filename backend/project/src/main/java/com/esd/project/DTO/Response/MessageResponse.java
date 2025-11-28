package com.esd.project.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    
    private String message;
    private Map<String, Object> data;
    
    public MessageResponse(String message) {
        this.message = message;
    }
}

