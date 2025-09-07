package com.synergizglobal.dms.service.impl;

import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.synergizglobal.dms.dto.CorrespondenceUploadLetter;
import com.synergizglobal.dms.entity.CorrespondenceLetter;
import com.synergizglobal.dms.entity.ReferenceLetter;
import com.synergizglobal.dms.repository.CorrespondenceLetterRepository;
import com.synergizglobal.dms.repository.ReferenceLetterRepository;
import com.synergizglobal.dms.service.ICorrespondenceService;

@Service
public class CorrespondenceServiceImpl implements ICorrespondenceService {
	
	@Autowired
	CorrespondenceLetterRepository correspondenceRepo;
	
	@Autowired
	FileStorageService fileStorageService;
	
	@Autowired
	ReferenceLetterRepository referenceRepo;
	
	@Autowired
	EmailServiceImpl emailService;

	@Override
	public CorrespondenceLetter saveLetter(CorrespondenceUploadLetter dto) throws Exception {

	    // 1️⃣ Create parent entity
	    CorrespondenceLetter entity = new CorrespondenceLetter();
	    entity.setCategory(dto.getCategory());
	    entity.setLetterName(dto.getLetterName());
	    entity.setLetterDate(LocalDate.now());
	    entity.setTo(dto.getTo());
	    entity.setCcRecipient(dto.getCc());
	    entity.setSubject(dto.getSubject());
	    entity.setKeyInformation(dto.getKeyInformation());
	    entity.setRequiredInformation(dto.getRequiredInformation());
	    entity.setRequiredResponse(dto.getRequiredResponse());
	    entity.setDueDate(LocalDate.now());
	    entity.setCurrentStatus(dto.getCurrenetStatus());
	    entity.setAction(dto.getAction());

	    
	    final CorrespondenceLetter parent = entity; 
	    if (dto.getReferenceLetters() != null && !dto.getReferenceLetters().isEmpty()) {
	        List<ReferenceLetter> refs = dto.getReferenceLetters().stream()
	            .map(refNum -> {
	                ReferenceLetter ref = new ReferenceLetter();
	                ref.setLetterNumber(refNum);          
	                ref.setCorrespondenceLetter(parent);  
	                return ref;
	            })
	            .toList();
	        entity.setReferenceLetters(refs);
	    }

	    
	    entity = saveFileDetails(dto, entity);
	    
	    CorrespondenceLetter savedEntity = correspondenceRepo.save(entity);
	    
	    if (dto.getAction().equalsIgnoreCase(entity.getAction())) {
           
            emailService.sendCorrespondenceEmail(savedEntity, dto.getDocuments());
         }
	    
	    return savedEntity ;
	    
	    
	    
	}

private CorrespondenceLetter saveFileDetails(CorrespondenceUploadLetter dto, CorrespondenceLetter entity) throws Exception {
    List<MultipartFile> documents = dto.getDocuments();

    if (documents != null && !documents.isEmpty()) {
        // Save multiple files and get the saved paths
        List<String> filePaths = fileStorageService.saveFiles(documents);

        // For simplicity, let’s store the first file’s details in entity
        // (or extend entity to handle multiple file details if needed)
        MultipartFile firstFile = documents.get(0);
        String firstPath = filePaths.get(0);

        entity.setFileName(Paths.get(firstPath).getFileName().toString());  // actual saved file name
        entity.setFileType(firstFile.getContentType());
        entity.setFilePath(firstPath);

    }

    return entity;

}



public List<ReferenceLetter> searchReferenceLetters(String keyword) {
    return referenceRepo.findByLetterNumberContainingIgnoreCase(keyword);
}

public List<CorrespondenceLetter> getAllCorrespondences() {
    return correspondenceRepo.findAll();
}

public List<CorrespondenceLetter> getLettersByAction(String action) {
    return correspondenceRepo.findLetters(action);

}}
