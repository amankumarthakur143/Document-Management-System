package com.synergizglobal.dms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.ToString;

@Entity
@Table(name =  "REFERENCE_LETTER")
public class ReferenceLetter {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long refId;
	
	@Column(name = "LETTER_NUMBER", length = 100, nullable = false)
	private String letterNumber;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CORRESPONDENCE_ID")
	@ToString.Exclude
	private CorrespondenceLetter correspondenceLetter;

	public Long getRefId() {
		return refId;
	}

	public void setRefId(Long refId) {
		this.refId = refId;
	}

	public String getLetterNumber() {
		return letterNumber;
	}

	public void setLetterNumber(String letterNumber) {
		this.letterNumber = letterNumber;
	}

	public CorrespondenceLetter getCorrespondenceLetter() {
		return correspondenceLetter;
	}

	public void setCorrespondenceLetter(CorrespondenceLetter correspondenceLetter) {
		this.correspondenceLetter = correspondenceLetter;
	}
	
	

}
