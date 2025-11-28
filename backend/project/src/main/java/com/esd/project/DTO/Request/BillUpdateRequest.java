package com.esd.project.DTO.Request;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillUpdateRequest {
    
    private String description;
    
    @Positive(message = "Amount must be positive")
    private Double amount;
    
    private LocalDate billDate;
    
    private LocalDate deadline;
}

