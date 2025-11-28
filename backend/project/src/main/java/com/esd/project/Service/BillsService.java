package com.esd.project.Service;

import com.esd.project.DTO.Request.BillRequest;
import com.esd.project.DTO.Request.BillUpdateRequest;
import com.esd.project.DTO.Response.BillResponse;
import com.esd.project.Entity.Bills;
import com.esd.project.Exception.ResourceNotFoundException;
import com.esd.project.Mapper.BillMapper;
import com.esd.project.Repository.BillsRepository;
import com.esd.project.Repository.StudentBillsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillsService {

    private final BillsRepository billsRepository;
    private final StudentBillsRepository studentBillsRepository;

    public BillsService(BillsRepository billsRepository, StudentBillsRepository studentBillsRepository) {
        this.billsRepository = billsRepository;
        this.studentBillsRepository = studentBillsRepository;
    }

    public BillResponse addBill(BillRequest request) {
        Bills bill = BillMapper.toEntity(request);
        Bills savedBill = billsRepository.save(bill);
        return BillMapper.toResponse(savedBill);
    }

    public List<BillResponse> getAllBills() {
        return billsRepository.findAll().stream()
                .map(BillMapper::toResponse)
                .collect(Collectors.toList());
    }

    public BillResponse getBillById(Long billId) {
        Bills bill = billsRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + billId));
        return BillMapper.toResponse(bill);
    }

    @Transactional
    public BillResponse updateBillPartially(Long billId, BillUpdateRequest request) {
        Bills existing = billsRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + billId));

        BillMapper.updateEntityFromRequest(existing, request);
        Bills updatedBill = billsRepository.save(existing);
        return BillMapper.toResponse(updatedBill);
    }

    @Transactional
    public void deleteBillEverywhere(Long billId) {
        studentBillsRepository.deleteByBill_BillId(billId);

        if (!billsRepository.existsById(billId)) {
            throw new ResourceNotFoundException("Bill not found with ID: " + billId);
        }

        billsRepository.deleteById(billId);
    }
}

