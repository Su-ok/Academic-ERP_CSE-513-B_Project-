package com.esd.project.Repository;

import com.esd.project.Entity.Domain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DomainRepository extends JpaRepository<Domain, Long> {

    Domain findByDomainName(String domainName);
}
