package com.esd.project.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "student_bills")
@Data
public class StudentBills {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bills bill;
}
