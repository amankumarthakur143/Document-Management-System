package com.synergizglobal.dms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.synergizglobal.dms.entity.SubFolder;

@Repository
public interface SubFolderRepository extends JpaRepository<SubFolder, Long> {
}
