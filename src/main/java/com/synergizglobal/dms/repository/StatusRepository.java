package com.synergizglobal.dms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.synergizglobal.dms.entity.Status;

@Repository
public interface StatusRepository extends JpaRepository<Status, Long> {
    boolean existsByName(String name);
}
