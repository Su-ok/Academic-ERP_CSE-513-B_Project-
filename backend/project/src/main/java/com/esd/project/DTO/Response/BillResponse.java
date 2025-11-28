package com.esd.project.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillResponse {
    
    private Long billId;
    private String description;
    private Double amount;
    private LocalDate billDate;
    private LocalDate deadline;
}

