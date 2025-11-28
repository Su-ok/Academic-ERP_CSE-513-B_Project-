package com.esd.project.Mapper;

import com.esd.project.DTO.Request.BillRequest;
import com.esd.project.DTO.Request.BillUpdateRequest;
import com.esd.project.DTO.Response.BillResponse;
import com.esd.project.Entity.Bills;

public class BillMapper {
    
    public static Bills toEntity(BillRequest request) {
        Bills bill = new Bills();
        bill.setDescription(request.getDescription());
        bill.setAmount(request.getAmount());
        bill.setBillDate(request.getBillDate());
        bill.setDeadline(request.getDeadline());
        return bill;
    }
    
    public static BillResponse toResponse(Bills bill) {
        if (bill == null) {
            return null;
        }
        return new BillResponse(
                bill.getBillId(),
                bill.getDescription(),
                bill.getAmount(),
                bill.getBillDate(),
                bill.getDeadline()
        );
    }
    
    public static void updateEntityFromRequest(Bills existingBill, BillUpdateRequest request) {
        if (request.getDescription() != null) {
            existingBill.setDescription(request.getDescription());
        }
        if (request.getAmount() != null) {
            existingBill.setAmount(request.getAmount());
        }
        if (request.getBillDate() != null) {
            existingBill.setBillDate(request.getBillDate());
        }
        if (request.getDeadline() != null) {
            existingBill.setDeadline(request.getDeadline());
        }
    }
}

