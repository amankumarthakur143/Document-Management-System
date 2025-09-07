package com.synergizglobal.dms.service;

import java.util.List;

import com.synergizglobal.dms.dto.DepartmentDTO;


public interface DepartmentService {

	 public DepartmentDTO createDepartment(DepartmentDTO dto) ;
	 
	 public List<DepartmentDTO> getAllDepartments();
	 
	 public DepartmentDTO updateDepartment(Long id, DepartmentDTO dto);
	 
	 public void deleteDepartment(Long id);
	 
}
