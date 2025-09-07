package com.synergizglobal.dms.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.synergizglobal.dms.entity.Folder;

public interface FolderRepository extends JpaRepository<Folder, Long> {

}
