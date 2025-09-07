package com.synergizglobal.dms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.synergizglobal.dms.entity.CorrespondenceLetter;

@Repository
public interface CorrespondenceLetterRepository extends JpaRepository<CorrespondenceLetter, Long>{

	@Query("SELECT c FROM CorrespondenceLetter c WHERE  c.action = :action")
    List<CorrespondenceLetter> findLetters(@Param("action") String action);
}
