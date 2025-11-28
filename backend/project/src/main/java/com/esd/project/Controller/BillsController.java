package com.esd.project.Controller;

import com.esd.project.DTO.Request.BillRequest;
import com.esd.project.DTO.Request.BillUpdateRequest;
import com.esd.project.DTO.Response.BillResponse;
import com.esd.project.DTO.Response.MessageResponse;
import com.esd.project.Service.BillsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bills")
public class BillsController {

    private final BillsService billsService;

    public BillsController(BillsService billsService) {
        this.billsService = billsService;
    }

    // CREATE BILL
    @PostMapping("/add-bill")
    public ResponseEntity<BillResponse> addBill(@Valid @RequestBody BillRequest request) {
        return ResponseEntity.status(201).body(billsService.addBill(request));
    }

    // GET ALL BILLS
    @GetMapping("/show-all-bills")
    public ResponseEntity<List<BillResponse>> getAllBills() {
        return ResponseEntity.ok(billsService.getAllBills());
    }

    // GET BILL BY ID
    @GetMapping("/{billId}")
    public ResponseEntity<BillResponse> getBillById(@PathVariable Long billId) {
        return ResponseEntity.ok(billsService.getBillById(billId));
    }

    // PARTIAL UPDATE BILL
    @PatchMapping("/update-bill-details/{billId}")
    public ResponseEntity<BillResponse> updateBillPartially(
            @PathVariable Long billId,
            @Valid @RequestBody BillUpdateRequest request
    ) {
        return ResponseEntity.ok(billsService.updateBillPartially(billId, request));
    }

    // DELETE BILL FROM BOTH TABLES
    @DeleteMapping("/delete-billid/{billId}")
    public ResponseEntity<MessageResponse> deleteBill(@PathVariable Long billId) {
        billsService.deleteBillEverywhere(billId);
        Map<String, Object> data = new HashMap<>();
        data.put("billId", billId);
        return ResponseEntity.ok(new MessageResponse(
                "Bill deleted from both bills table and student_bills table",
                data
        ));
    }
}
