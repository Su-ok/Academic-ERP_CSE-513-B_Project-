package com.esd.project.Repository;

import com.esd.project.Entity.Bills;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillsRepository extends JpaRepository<Bills, Long> {
}
