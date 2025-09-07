package com.synergizglobal.dms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.synergizglobal.dms.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long>{

	Optional<Department> findByName(String name);
	
}
