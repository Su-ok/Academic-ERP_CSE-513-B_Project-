package com.esd.project.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentBillResponse {
    
    private Long id;
    private String rollNumber;
    private String studentName;
    private String studentEmail;
    private Long billId;
    private String billDescription;
    private Double billAmount;
    private String billDate;
    private String deadline;
}

