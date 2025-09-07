package com.synergizglobal.dms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.synergizglobal.dms.entity.ReferenceLetter;

public interface ReferenceLetterRepository extends JpaRepository<ReferenceLetter, Long> {

	List<ReferenceLetter> findByLetterNumberContainingIgnoreCase(String keyword);
	
}
