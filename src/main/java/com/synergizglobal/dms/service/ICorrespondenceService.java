package com.synergizglobal.dms.service;

import java.util.List;

import com.synergizglobal.dms.dto.CorrespondenceUploadLetter;
import com.synergizglobal.dms.entity.CorrespondenceLetter;

public interface ICorrespondenceService {
	

	public CorrespondenceLetter saveLetter(CorrespondenceUploadLetter dto) throws Exception;
	public List<CorrespondenceLetter> getLettersByAction(String action);
}
