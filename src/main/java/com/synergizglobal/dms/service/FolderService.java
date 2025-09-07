package com.synergizglobal.dms.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.synergizglobal.dms.dto.FolderDTO;

@Service
public interface FolderService {


    public List<FolderDTO> getAllFolders();

    public FolderDTO getFolderById(Long id); 
       

    public FolderDTO createFolder(FolderDTO folderDTO);
    public FolderDTO updateFolder(Long id, FolderDTO folderDTO);

    public void deleteFolder(Long id);
}
