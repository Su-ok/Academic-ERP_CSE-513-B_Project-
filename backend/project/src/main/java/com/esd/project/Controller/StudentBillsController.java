package com.esd.project.Controller;

import com.esd.project.DTO.Response.MessageResponse;
import com.esd.project.DTO.Response.StudentBillResponse;
import com.esd.project.Service.StudentBillsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/student-bills")
public class StudentBillsController {

    private final StudentBillsService studentBillsService;

    public StudentBillsController(StudentBillsService studentBillsService) {
        this.studentBillsService = studentBillsService;
    }

    // ASSIGN BILL TO A SINGLE STUDENT
    @PostMapping("/assign-to-roll/{rollNumber}/{billId}")
    public ResponseEntity<StudentBillResponse> assignBillToStudent(
            @PathVariable String rollNumber,
            @PathVariable Long billId
    ) {
        return ResponseEntity.status(201)
                .body(studentBillsService.assignBillToStudent(rollNumber, billId));
    }

    // ASSIGN BILL TO A DOMAIN
    @PostMapping("/assign-to-domain/{domain}/{billId}")
    public ResponseEntity<List<StudentBillResponse>> assignBillToDomain(
            @PathVariable String domain,
            @PathVariable Long billId
    ) {
        return ResponseEntity.status(201)
                .body(studentBillsService.assignBillToDomain(domain, billId));
    }

    // GET ALL BILLS FOR STUDENT
    @GetMapping("/all-bills-of-roll/{rollNumber}")
    public ResponseEntity<List<StudentBillResponse>> getBillsByRoll(@PathVariable String rollNumber) {
        return ResponseEntity.ok(studentBillsService.getBillsByRollNumber(rollNumber));
    }

    // DELETE ALL BILLS FOR STUDENT
    @DeleteMapping("/delete-student-bill/{rollNumber}")
    public ResponseEntity<MessageResponse> deleteBillsByRoll(@PathVariable String rollNumber) {
        studentBillsService.deleteBillsByRollNumber(rollNumber);
        Map<String, Object> data = new HashMap<>();
        data.put("rollNumber", rollNumber);
        return ResponseEntity.ok(new MessageResponse("Deleted all bills for student", data));
    }

    // DELETE ONE SPECIFIC BILL FOR STUDENT
    @DeleteMapping("/delete-bill-of-roll/{rollNumber}/bill/{billId}")
    public ResponseEntity<MessageResponse> deleteSpecificBill(
            @PathVariable String rollNumber,
            @PathVariable Long billId
    ) {
        studentBillsService.deleteSpecificBillForStudent(rollNumber, billId);
        Map<String, Object> data = new HashMap<>();
        data.put("rollNumber", rollNumber);
        data.put("billId", billId);
        return ResponseEntity.ok(new MessageResponse("Deleted bill for student", data));
    }
}
