package com.esd.project.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long employeeId;

    @Column(nullable = false)
    private String firstName = "Unknown";

    @Column(nullable = false)
    private String lastName = "User";

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String title = "Finance Officer";   // DEFAULT TITLE

    private String photoPath;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department; // assigned by system
}
