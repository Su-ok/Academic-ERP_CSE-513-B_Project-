package com.esd.project.Repository;

import com.esd.project.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Student findByRollNumber(String rollNumber);
    List<Student> findByDomain_DomainId(Long domainId);

}
