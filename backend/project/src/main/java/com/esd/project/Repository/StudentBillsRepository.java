package com.esd.project.Repository;

import com.esd.project.Entity.StudentBills;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentBillsRepository extends JpaRepository<StudentBills, Long> {

    List<StudentBills> findByStudent_RollNumber(String rollNumber);

    void deleteByStudent_RollNumber(String rollNumber);

    StudentBills findByStudent_RollNumberAndBill_BillId(String rollNumber, Long billId);

    boolean existsByStudent_StudentIdAndBill_BillId(Long studentId, Long billId);

    void deleteByBill_BillId(Long billId);
}
