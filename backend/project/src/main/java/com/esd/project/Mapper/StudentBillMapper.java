package com.esd.project.Mapper;

import com.esd.project.DTO.Response.StudentBillResponse;
import com.esd.project.Entity.StudentBills;

import java.time.format.DateTimeFormatter;

public class StudentBillMapper {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    public static StudentBillResponse toResponse(StudentBills studentBill) {
        if (studentBill == null || studentBill.getStudent() == null || studentBill.getBill() == null) {
            return null;
        }
        
        return new StudentBillResponse(
                studentBill.getId(),
                studentBill.getStudent().getRollNumber(),
                studentBill.getStudent().getName(),
                studentBill.getStudent().getEmail(),
                studentBill.getBill().getBillId(),
                studentBill.getBill().getDescription(),
                studentBill.getBill().getAmount(),
                studentBill.getBill().getBillDate() != null 
                        ? studentBill.getBill().getBillDate().format(DATE_FORMATTER) 
                        : null,
                studentBill.getBill().getDeadline() != null 
                        ? studentBill.getBill().getDeadline().format(DATE_FORMATTER) 
                        : null
        );
    }
}

