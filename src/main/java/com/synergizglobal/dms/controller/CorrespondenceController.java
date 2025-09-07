package com.synergizglobal.dms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.synergizglobal.dms.dto.CorrespondenceUploadLetter;
import com.synergizglobal.dms.entity.CorrespondenceLetter;
import com.synergizglobal.dms.service.ICorrespondenceService;

@RestController
@RequestMapping("/api/correspondence")
public class CorrespondenceController {
	
	@Autowired
	ICorrespondenceService correspondenceService;
	
	@PostMapping(value = "/uploadLetter", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> uploadLetter(
	        @RequestPart("dto") String dtoJson,
	        @RequestPart("document") List<MultipartFile> documents) {
	    try {
	        // Convert JSON string to DTO
	        ObjectMapper mapper = new ObjectMapper();
	        CorrespondenceUploadLetter dto = mapper.readValue(dtoJson, CorrespondenceUploadLetter.class);

	        // Attach the file
	        dto.setDocuments(documents);

	        // Save using service
	        CorrespondenceLetter savedLetter = correspondenceService.saveLetter(dto);

	        return ResponseEntity.ok("Letter uploaded successfully: " + savedLetter.getLetterName());
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.badRequest().body("Failed to upload letter: " + e.getMessage());
	    }
	}
	
	
	@GetMapping("/getCorrespondeneceList")
    public ResponseEntity<List<CorrespondenceLetter>> getCorrespondeneceList(
            @RequestParam String action) {
		
		List<CorrespondenceLetter> lettersByAction = correspondenceService.getLettersByAction(action);
		
		
		return new ResponseEntity<List<CorrespondenceLetter>>(lettersByAction, HttpStatus.OK);
	}

}
