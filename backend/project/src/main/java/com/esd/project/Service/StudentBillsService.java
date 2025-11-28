
package com.esd.project.Service;

import com.esd.project.DTO.Response.StudentBillResponse;
import com.esd.project.Entity.Bills;
import com.esd.project.Entity.Domain;
import com.esd.project.Entity.Student;
import com.esd.project.Entity.StudentBills;
import com.esd.project.Exception.BusinessException;
import com.esd.project.Exception.ResourceNotFoundException;
import com.esd.project.Mapper.StudentBillMapper;
import com.esd.project.Repository.BillsRepository;
import com.esd.project.Repository.DomainRepository;
import com.esd.project.Repository.StudentBillsRepository;
import com.esd.project.Repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentBillsService {

    private final StudentBillsRepository studentBillsRepository;
    private final StudentRepository studentRepository;
    private final BillsRepository billsRepository;
    private final DomainRepository domainRepository;

    public StudentBillsService(StudentBillsRepository studentBillsRepository,
                               StudentRepository studentRepository,
                               BillsRepository billsRepository,
                               DomainRepository domainRepository) {

        this.studentBillsRepository = studentBillsRepository;
        this.studentRepository = studentRepository;
        this.billsRepository = billsRepository;
        this.domainRepository = domainRepository;
    }

    // Assign bill to one student
    @Transactional
    public StudentBillResponse assignBillToStudent(String rollNumber, Long billId) {

        Student student = studentRepository.findByRollNumber(rollNumber);
        if (student == null) {
            throw new ResourceNotFoundException("Student not found: " + rollNumber);
        }

        Bills bill = billsRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + billId));

        // Prevent duplicate entries
        boolean exists = studentBillsRepository
                .existsByStudent_StudentIdAndBill_BillId(student.getStudentId(), billId);

        if (exists) {
            throw new BusinessException("Bill already assigned to student: " + rollNumber);
        }

        StudentBills sb = new StudentBills();
        sb.setStudent(student);
        sb.setBill(bill);

        StudentBills saved = studentBillsRepository.save(sb);
        return StudentBillMapper.toResponse(saved);
    }

    // Get bills by roll number
    public List<StudentBillResponse> getBillsByRollNumber(String rollNumber) {

        Student student = studentRepository.findByRollNumber(rollNumber);
        if (student == null) {
            throw new ResourceNotFoundException("No student found with roll number " + rollNumber);
        }

        return studentBillsRepository.findByStudent_RollNumber(rollNumber).stream()
                .map(StudentBillMapper::toResponse)
                .collect(Collectors.toList());
    }

    // Delete all bills for student
    @Transactional
    public void deleteBillsByRollNumber(String rollNumber) {

        Student student = studentRepository.findByRollNumber(rollNumber);
        if (student == null) {
            throw new ResourceNotFoundException("Student not found: " + rollNumber);
        }

        studentBillsRepository.deleteByStudent_RollNumber(rollNumber);
    }

    // Delete specific bill record
    @Transactional
    public void deleteSpecificBillForStudent(String rollNumber, Long billId) {

        StudentBills sb = studentBillsRepository
                .findByStudent_RollNumberAndBill_BillId(rollNumber, billId);

        if (sb == null) {
            throw new ResourceNotFoundException("Bill " + billId + " not assigned to student " + rollNumber);
        }

        studentBillsRepository.delete(sb);
    }

    // Assign to all students in a domain
    @Transactional
    public List<StudentBillResponse> assignBillToDomain(String domainName, Long billId) {

        Domain domain = domainRepository.findByDomainName(domainName);
        if (domain == null) {
            throw new ResourceNotFoundException("Domain not found: " + domainName);
        }

        List<Student> students = studentRepository.findByDomain_DomainId(domain.getDomainId());
        if (students.isEmpty()) {
            throw new BusinessException("No students found in domain: " + domainName);
        }

        Bills bill = billsRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + billId));

        List<StudentBills> assigned = new ArrayList<>();

        for (Student student : students) {

            boolean exists = studentBillsRepository
                    .existsByStudent_StudentIdAndBill_BillId(student.getStudentId(), billId);

            if (exists) continue;

            StudentBills sb = new StudentBills();
            sb.setStudent(student);
            sb.setBill(bill);

            assigned.add(studentBillsRepository.save(sb));
        }

        return assigned.stream()
                .map(StudentBillMapper::toResponse)
                .collect(Collectors.toList());
    }
}
