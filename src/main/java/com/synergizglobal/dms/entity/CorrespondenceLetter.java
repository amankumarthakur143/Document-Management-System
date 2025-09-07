package com.synergizglobal.dms.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name ="CORRESPONDENCE_LETTER")
@NoArgsConstructor
@AllArgsConstructor
public class CorrespondenceLetter {
	
	

	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    @Column(name = "CORRESPONDENCE_ID")
	    private Long correspondenceId;

	    @Column(name = "CATEGORY", length = 100, nullable = false)
	    private String category;

	    @Column(name = "LETTER_NAME", length = 200, nullable = false)
	    private String letterName;

	    @Column(name = "LETTER_DATE")
	    private LocalDate letterDate;

	    @Column(name = "RECIPIENT", length = 200)
	    private String to;

	    
	    @Column(name = "CC_RECIPIENT", length = 200)
	    private List<String> ccRecipient;
		
	    
	    
	    @Column(name = "SUBJECT", length = 500)
	    private String subject;

	  
	    @Column(name = "KEY_INFORMATION")
	    private String keyInformation;

	    
	    @Column(name = "REQUIRED_INFORMATION")
	    private String requiredInformation;

	  
	    @Column(name = "REQUIRED_RESPONSE")
	    private String requiredResponse;

	    @Column(name = "DUE_DATE")
	    private LocalDate dueDate;

	    @Column(name = "CURRENT_STATUS", length = 100)
	    private String currentStatus;

	    // File metadata (instead of file bytes)
	    @Column(name = "FILE_NAME")
	    private String fileName;

	    @Column(name = "FILE_TYPE")
	    private String fileType;

	    @Column(name = "FILE_PATH")
	    private String filePath;

	    @Column(name = "CREATED_AT", updatable = false)
	    @CreationTimestamp
	    private LocalDateTime createdAt;

	    @Column(name = "UPDATED_AT")
	    @UpdateTimestamp
	    private LocalDateTime updatedAt;
	    
	    @Column(name = "ACTION")
	    private String action;
	    
	    
	    @OneToMany(mappedBy = "correspondenceLetter",
	            cascade = CascadeType.ALL,
	            orphanRemoval = true)
	 private List<ReferenceLetter> referenceLetters;



}
