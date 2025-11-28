package com.esd.project.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Domain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long domainId;

    @Column(nullable = false, unique = true)
    private String domainName;
}
