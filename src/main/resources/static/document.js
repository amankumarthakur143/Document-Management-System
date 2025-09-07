$(document).ready(function () {
    // Global variables
    let selectedDocument = null;
    let uploadedMetadataFile = null;
    let uploadedZipFile = null;
    let updateUploadedMetadataFile = null;
    let updateUploadedZipFile = null;
    let mainTableInstance = null;
    let draftTableInstance = null;
    let currentUpdateRow = null;
    let columnFilters = {};

    // Folder and Sub-folder dependency mapping
    const folderSubFolderMap = {
        'Drawing': ['MJ RUBs', 'ROBs', 'MJBs', 'MNB MNRUB', 'Earthwork', 'Structural', 'Architectural', 'MEP'],
        'Correspondence': ['Internal', 'External', 'Client', 'Contractor', 'Consultant'],
        'MOMs': ['Site Meeting', 'Progress Meeting', 'Safety Meeting', 'Technical Meeting', 'Coordination Meeting'],
        'Report': ['Progress Report', 'Technical Report', 'Safety Report', 'Quality Report', 'Inspection Report'],
        'Work Programme': ['Monthly', 'Weekly', 'Daily', 'Milestone', 'Critical Path'],
        'Manuals': ['Operation Manual', 'Maintenance Manual', 'Safety Manual', 'Quality Manual', 'Technical Manual'],
        'RFI': ['Technical RFI', 'Commercial RFI', 'Design RFI', 'Construction RFI'],
        'Contracts': ['Main Contract', 'Sub Contract', 'Amendment', 'Variation Order', 'Agreement'],
        'SHE': ['Safety Plan', 'Incident Report', 'Audit Report', 'Training Record', 'Risk Assessment'],
        'Quality': ['Quality Plan', 'Test Certificate', 'Inspection Report', 'Non Conformance', 'Quality Audit'],
        'Billing': ['Invoice', 'Payment Certificate', 'Variation Bill', 'Final Bill', 'Interim Bill'],
        'Legal': ['Legal Notice', 'Agreement', 'Compliance', 'Dispute', 'Contract Review']
    };

    // Initialize DataTables
    function initializeDataTables() {
        if (!mainTableInstance && $('#mainTable').length) {
            mainTableInstance = $('#mainTable').DataTable({
                "language": {
                    "lengthMenu": "Show _MENU_ entries",
                    "info": "Showing _START_ to _END_ of _TOTAL_ entries"
                },
                "pageLength": 10,
                "destroy": true,
                "drawCallback": function () {
                    updateAllColumnFilters();
                }
            });
        }

        if (!draftTableInstance && $('#draftTable').length) {
            draftTableInstance = $('#draftTable').DataTable({
                "language": {
                    "lengthMenu": "Show _MENU_ entries",
                    "info": "Showing _START_ to _END_ of _TOTAL_ entries",
                    "emptyTable": "No drafts available"
                },
                "pageLength": 10,
                "destroy": true
            });
        }
    }

    // Initialize tables on page load
    initializeDataTables();

    // Function to update sub-folder options based on selected folder
    function updateSubFolderOptions(folderSelectId, subFolderSelectId) {
        const folderValue = $(folderSelectId).val();
        const subFolderSelect = $(subFolderSelectId);

        // Clear existing options
        subFolderSelect.empty().append('<option value="">Select Sub-Folder</option>');

        if (folderValue && folderSubFolderMap[folderValue]) {
            folderSubFolderMap[folderValue].forEach(function (subFolder) {
                subFolderSelect.append(`<option value="${subFolder}">${subFolder}</option>`);
            });
        }
    }

    // Event handlers for folder/sub-folder dependency
    $('#folder').change(function () {
        updateSubFolderOptions('#folder', '#subFolder');
    });

    $('#updateFolder').change(function () {
        updateSubFolderOptions('#updateFolder', '#updateSubFolder');
    });

    $('#previewFolder').change(function () {
        updateSubFolderOptions('#previewFolder', '#previewSubFolder');
    });

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = $(`
                    <div class="notification ${type}">
                        ${message}
                    </div>
                `);

        $('#notificationContainer').append(notification);
        notification.fadeIn();

        setTimeout(() => {
            notification.fadeOut(() => {
                notification.remove();
            });
        }, 3000);
    }

    // Field validation functions
    function validateField(field) {
        const $field = $(field);
        const value = $field.val().trim();
        const fieldType = $field.attr('type');
        const isRequired = $field.closest('.form-group, .upload-form-section, .preview-form-section').find('label').text().includes('*');

        $field.removeClass('error-field success-field');
        $field.siblings('.error-message').removeClass('show');

        if (isRequired && (!value || value === '')) {
            $field.addClass('error-field');
            $field.siblings('.error-message').addClass('show');
            return false;
        } else if (fieldType === 'email' && value && !isValidEmail(value)) {
            $field.addClass('error-field');
            $field.siblings('.error-message').text('Please enter a valid email address').addClass('show');
            return false;
        } else if (value) {
            $field.addClass('success-field');
            return true;
        }

        return true;
    }

    function validateForm(formSelector) {
        let isValid = true;
        const $form = $(formSelector);

        $form.find('input, select, textarea').each(function () {
            if (!validateField(this)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Real-time validation
    $(document).on('input change blur', 'input, select, textarea', function () {
        validateField(this);
    });

    // Upload button click - show modal
    $('#uploadBtn').click(function (e) {
        e.preventDefault();
        $('#uploadModal').css('display', 'flex');
    });

    // Draft button click: show draft table, hide main table
    $('#draftBtn').click(function () {
        $('.table-container').hide();
        $('#draftTableContainer').show();
        $('#backToMainBtn').show();

        if (draftTableInstance) {
            draftTableInstance.draw();
        }
    });

    // Back to Documents button handler
    $('#backToMainBtn').click(function () {
        $('#draftTableContainer').hide();
        $('#mainTableContainer').show();
        $(this).hide();
    });

    // Upload modal tabs
    $('#uploadModal .upload-tab').click(function () {
        $('#uploadModal .upload-tab').removeClass('active');
        $(this).addClass('active');

        const tabType = $(this).data('tab');
        $('.single-upload-options, .bulk-upload-options').removeClass('active');

        if (tabType === 'single') {
            $('#singleUploadTab').addClass('active');
        } else {
            $('#bulkUploadTab').addClass('active');
        }
    });

    // Update modal tabs
    $('#updateDocumentsModal .upload-tab').click(function () {
        $('#updateDocumentsModal .upload-tab').removeClass('active');
        $(this).addClass('active');

        const tabType = $(this).data('tab');
        $('.single-update-options, .bulk-update-options').removeClass('active');

        if (tabType === 'single') {
            $('#singleUpdateTab').addClass('active');
        } else {
            $('#bulkUpdateTab').addClass('active');
        }
    });

    // Close upload modal
    $('#cancelUpload').click(function () {
        $('#uploadModal').hide();
        resetUploadForm();
    });

    // Close modal when clicking outside - Upload
    $('#uploadModal').click(function (e) {
        if (e.target === this) {
            $(this).hide();
            resetUploadForm();
        }
    });

    // Save upload
    $('#saveUpload').click(function () {
        const activeTab = $('#uploadModal .upload-tab.active').data('tab');
        if (activeTab === 'single') {
            handleSingleUpload();
        } else {
            handleBulkUpload();
        }
    });

    // Right-click context menu for file name cells
    $(document).on('contextmenu', '.file-name-cell', function (e) {
        e.preventDefault();
        const contextMenu = $('#contextMenu');

        contextMenu.css({
            top: e.pageY + 'px',
            left: e.pageX + 'px',
            display: 'block'
        });

        contextMenu.data('target-cell', $(this));
        return false;
    });

    // Hide context menu on click elsewhere
    $(document).click(function () {
        $('#contextMenu').hide();
    });

    // Handle context menu item clicks
    $('.context-menu-item').click(function () {
        const action = $(this).data('action');
        const targetCell = $('#contextMenu').data('target-cell');

        handleContextMenuAction(action, targetCell);
        $('#contextMenu').hide();
    });

    // Send Documents Modal handlers
    $('#cancelSend').click(function () {
        $('#sendDocumentsModal').hide();
        resetSendForm();
    });

    $('#sendDocumentsModal').click(function (e) {
        if (e.target === this) {
            $(this).hide();
            resetSendForm();
        }
    });

    $('#sendDocument').click(function () {
        if (validateForm('#sendDocumentsModal')) {
            showNotification('Document sent successfully!', 'success');
            $('#sendDocumentsModal').hide();
            resetSendForm();
        }
    });

    // Save Draft button in Send Documents modal
    $('#saveDraft').click(function () {
        const to = $('#sendTo').val().trim();
        const cc = $('#sendCc').val().trim();
        const subject = $('#sendSubject').val().trim();
        const reason = $('#sendReason').val().trim();
        const responseExpected = $('#responseExpected').val();
        const targetDate = $('#targetResponseDate').val();
        const attachments = [];

        $('#attachmentsList .attachment-item span').each(function () {
            attachments.push($(this).text());
        });

        const dateSaved = new Date();
        const formattedDate = ('0' + dateSaved.getDate()).slice(-2) + '.' + ('0' + (dateSaved.getMonth() + 1)).slice(-2) + '.' + dateSaved.getFullYear();

        if (draftTableInstance) {
            draftTableInstance.row.add([
                to,
                cc,
                subject,
                reason,
                responseExpected ? (responseExpected.charAt(0).toUpperCase() + responseExpected.slice(1)) : '',
                targetDate ? formatDateForDisplay(targetDate) : '',
                attachments.join('<br>'),
                formattedDate
            ]).draw();
        }

        showNotification('Draft saved successfully!', 'success');
        $('#sendDocumentsModal').hide();
        resetSendForm();
    });

    // Update Documents Modal handlers
    $('#cancelUpdate').on('click', function () {
        $('#updateDocumentsModal').removeClass('show');
        currentUpdateRow = null;
    });

    $('#updateDocumentsModal').click(function (e) {
        if (e.target === this) {
            $(this).hide();
            resetUpdateForm();
        }
    });

    $('#updateDocument').on('click', function () {
        const activeTab = $('#updateDocumentsModal .upload-tab.active').data('tab');
        if (activeTab === 'single') {
            if (!currentUpdateRow) return;

            const newFileName = $('#updateFileName').val();
            const newFileNumber = $('#updateFileNumber').val();
            const newRevisionNo = $('#updateRevisionNo').val();
            const newRevisionDate = $('#updateRevisionDate').val();
            const newFolder = $('#updateFolder').val();
            const newSubFolder = $('#updateSubFolder').val();
            const newDepartment = $('#updateDepartment').val();
            const newStatus = $('#updateCurrentStatus').val();

            // Update table row with new column positions
            currentUpdateRow.find('td').eq(2).find('input').val(newFileName);
            currentUpdateRow.find('td').eq(1).find('input').val(newFileNumber);
            currentUpdateRow.find('td').eq(3).find('input').val(newRevisionNo);
            currentUpdateRow.find('td').eq(10).find('input').val(newRevisionDate);
            currentUpdateRow.find('td').eq(6).find('input').val(newFolder);
            currentUpdateRow.find('td').eq(7).find('input').val(newSubFolder);
            currentUpdateRow.find('td').eq(11).find('input').val(newDepartment);
            currentUpdateRow.find('td').eq(4).find('input').val(newStatus);

            $('#updateDocumentsModal').removeClass('show');
            currentUpdateRow = null;
        } else if (activeTab === 'bulk') {
            alert('Bulk update saved (implement your logic here)');
            $('#updateDocumentsModal').removeClass('show');
            currentUpdateRow = null;
        }
    });

    // Bulk upload link handlers
    $('#downloadTemplate').click(function (e) {
        e.preventDefault();
        showNotification('Excel template download started...', 'info');
    });

    $('#uploadMetadata').click(function (e) {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.onchange = function (event) {
            const file = event.target.files[0];
            if (file) {
                const fileName = file.name.toLowerCase();
                const fileExtension = fileName.split('.').pop();

                if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
                    showNotification('Only Excel files (.xlsx, .xls) are allowed for metadata.', 'error');
                    return;
                }

                showUploadedFile('metadata', file.name);
                uploadedMetadataFile = file;
            }
        };
        input.click();
    });

    $('#uploadZipFile').click(function (e) {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip';
        input.onchange = function (event) {
            const file = event.target.files[0];
            if (file) {
                const fileName = file.name.toLowerCase();
                const fileExtension = fileName.split('.').pop();

                if (fileExtension !== 'zip') {
                    showNotification('Only ZIP files are allowed.', 'error');
                    return;
                }

                showUploadedFile('zip', file.name);
                uploadedZipFile = file;
            }
        };
        input.click();
    });

    $('#previewMetadata').click(function () {
        showPreviewMetadata();
    });

    // Bulk update link handlers
    $('#downloadUpdateTemplate').click(function (e) {
        e.preventDefault();
        showNotification('Excel template for bulk update download started...', 'info');
    });

    $('#uploadUpdateMetadata').click(function (e) {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.onchange = function (event) {
            const file = event.target.files[0];
            if (file) {
                showUpdateUploadedFile('update-metadata', file.name);
                updateUploadedMetadataFile = file;
            }
        };
        input.click();
    });

    $('#uploadUpdateZipFile').click(function (e) {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip';
        input.onchange = function (event) {
            const file = event.target.files[0];
            if (file) {
                showUpdateUploadedFile('update-zip', file.name);
                updateUploadedZipFile = file;
            }
        };
        input.click();
    });

    $('#previewUpdateMetadata').click(function () {
        showNotification('Preview update metadata functionality', 'info');
    });

    // Remove uploaded file handlers
    $(document).on('click', '.remove-file-btn', function () {
        const fileType = $(this).data('type');
        if (fileType.startsWith('update-')) {
            removeUpdateUploadedFile(fileType);
        } else {
            removeUploadedFile(fileType);
        }
    });

    // Preview metadata modal handlers - FIXED VERSION
    $('#cancelPreview').on('click', function () {
        $('#previewModal').css('display', 'none');
        $('#previewModal input, #previewModal select').removeClass('error-field success-field');
        $('#previewModal .error-message').removeClass('show');
    });

    $('#previewModal').on('click', function (e) {
        if ($(e.target).is('#previewModal')) {
            $('#previewModal').css('display', 'none');
            $('#previewModal input, #previewModal select').removeClass('error-field success-field');
            $('#previewModal .error-message').removeClass('show');
        }
    });

    $('#savePreview').on('click', function () {
        // Validate required fields in the preview modal
        let isValid = true;
        $('#previewModal input[required], #previewModal select[required]').each(function () {
            if (!$(this).val().trim()) {
                $(this).addClass('error-field');
                $(this).siblings('.error-message').addClass('show');
                isValid = false;
            } else {
                $(this).removeClass('error-field');
                $(this).siblings('.error-message').removeClass('show');
            }
        });

        if (!isValid) return;

        $('#previewModal').css('display', 'none');
        $('#previewModal input, #previewModal select').removeClass('error-field success-field');
        $('#previewModal .error-message').removeClass('show');
        showNotification('Metadata saved successfully!', 'success');
    });

    // File input change handlers
    $('#singleFileInput').change(function () {
        const files = this.files;
        if (files.length > 0) {
            $(this).removeClass('error-field').addClass('success-field');
            $(this).siblings('.error-message').removeClass('show');
        } else {
            $(this).addClass('error-field');
            $(this).siblings('.error-message').addClass('show');
        }
    });

    $('#updateDocumentFile').change(function () {
        const file = this.files[0];
        if (file) {
            console.log('Update file selected:', file.name);
        }
    });

    // HELPER FUNCTIONS

    function handleContextMenuAction(action, targetCell) {
        const fileName = targetCell.val() || targetCell.text();
        const row = targetCell.closest('tr');

        switch (action) {
            case 'send':
                const fileType = row.find('.file-type-label').text();
                const fileNumber = row.find('td:nth-child(2) input').val() || row.find('td:nth-child(2)').text();
                const revisionNo = row.find('td:nth-child(4) input').val() || row.find('td:nth-child(4)').text();
                const documentType = row.find('td:nth-child(6) input').val() || row.find('td:nth-child(6)').text();
                const folder = row.find('td:nth-child(7) input').val() || row.find('td:nth-child(7)').text();
                const subFolder = row.find('td:nth-child(8) input').val() || row.find('td:nth-child(8)').text();

                selectedDocument = {
                    fileName: fileName,
                    fileType: fileType,
                    fileNumber: fileNumber,
                    revisionNo: revisionNo,
                    documentType: documentType,
                    folder: folder,
                    subFolder: subFolder
                };

                showSendDocumentsModal();
                break;
            case 'update':
                const updateData = {
                    fileName: fileName,
                    fileType: row.find('.file-type-label').text(),
                    fileNumber: row.find('td:nth-child(2) input').val() || row.find('td:nth-child(2)').text(),
                    revisionNo: row.find('td:nth-child(4) input').val() || row.find('td:nth-child(4)').text(),
                    status: row.find('td:nth-child(5) input').val() || row.find('td:nth-child(5)').text(),
                    documentType: row.find('td:nth-child(6) input').val() || row.find('td:nth-child(6)').text(),
                    folder: row.find('td:nth-child(7) input').val() || row.find('td:nth-child(7)').text(),
                    subFolder: row.find('td:nth-child(8) input').val() || row.find('td:nth-child(8)').text(),
                    createdBy: row.find('td:nth-child(9) input').val() || row.find('td:nth-child(9)').text(),
                    dateUploaded: row.find('td:nth-child(10) input').val() || row.find('td:nth-child(10)').text(),
                    revisionDate: row.find('td:nth-child(11) input').val() || row.find('td:nth-child(11)').text(),
                    department: row.find('td:nth-child(12) input').val() || row.find('td:nth-child(12)').text()
                };

                selectedDocument = updateData;
                showUpdateDocumentsModal();
                break;
            case 'view-old':
                showNotification('Viewing old versions: ' + fileName, 'info');
                break;
            case 'not-required':
                showNotification('Marked as not required: ' + fileName, 'info');
                break;
            case 'download':
                showNotification('Downloading: ' + fileName, 'info');
                break;
            case 'print':
                showNotification('Printing: ' + fileName, 'info');
                break;
        }
    }

    function handleSingleUpload() {
        if (!validateForm('#singleUploadTab')) {
            return;
        }

        const files = $('#singleFileInput')[0].files;
        if (files.length === 0) {
            $('#singleFileInput').addClass('error-field');
            $('#singleFileInput').siblings('.error-message').addClass('show');
            return;
        }

        const formData = {
            fileName: $('#fileName').val().trim(),
            fileNumber: $('#fileNumber').val().trim(),
            revisionNo: $('#revisionNo').val(),
            revisionDate: $('#revisionDate').val(),
            folder: $('#folder').val(),
            subFolder: $('#subFolder').val(),
            department: $('#department').val(),
            status: $('#currentStatus').val()
        };

        // Check for duplicate file numbers
        let duplicateFound = false;
        if (mainTableInstance) {
            mainTableInstance.rows().every(function () {
                const rowData = this.node();
                const existingNumber = $(rowData).find('td:nth-child(2) input').val();
                if (existingNumber === formData.fileNumber) {
                    duplicateFound = true;
                    return false;
                }
            });
        }

        if (duplicateFound) {
            if (!confirm('A document with this file number already exists. Do you want to continue?')) {
                return;
            }
        }

        // Process files and add to table
        for (let i = 0; i < files.length; i++) {
            addFileToTable(files[i], formData);
        }

        showNotification(`Successfully uploaded ${files.length} file(s)`, 'success');
        $('#uploadModal').hide();
        resetUploadForm();
    }

    function handleBulkUpload() {
        if (!uploadedMetadataFile || !uploadedZipFile) {
            showNotification('Please upload both metadata file and ZIP file for bulk upload.', 'error');
            return;
        }

        showNotification('Processing bulk upload...', 'info');
        $('#uploadModal').hide();
        resetUploadForm();
    }

    function addFileToTable(file, metadata = {}) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const fileTypeClass = getFileTypeClass(fileExtension);
        const currentDate = getCurrentDateString();
        const currentUser = 'Mansi';

        const fileName = metadata.fileName || file.name;
        const fileNumber = metadata.fileNumber || '';
        const revisionNo = metadata.revisionNo || 'R01';
        const status = metadata.status || 'Draft';
        const department = metadata.department || '';
        const folder = metadata.folder || '';
        const subFolder = metadata.subFolder || '';

        const newRowData = [
            `<span class="file-type-label ${fileTypeClass} file-name-cell">${fileExtension.toUpperCase()}</span>`,
            `<input type="text" class="editable-input file-name-cell" value="${fileNumber}">`,
            `<input type="text" class="editable-input file-name-cell" value="${fileName}">`,
            `<input type="text" class="editable-input file-name-cell" value="${revisionNo}">`,
            `<input type="text" class="editable-input file-name-cell" value="${status}">`,
            `<input type="text" class="editable-input file-name-cell" value="${metadata.documentType || ''}">`,
            `<input type="text" class="editable-input file-name-cell" value="${folder}">`,
            `<input type="text" class="editable-input file-name-cell" value="${subFolder}">`,
            `<input type="text" class="editable-input file-name-cell" value="${currentUser}">`,
            `<input type="text" class="editable-input file-name-cell" value="${currentDate}">`,
            `<input type="text" class="editable-input file-name-cell" value="${formatDateForDisplay(metadata.revisionDate) || currentDate}">`,
            `<input type="text" class="editable-input file-name-cell" value="${department}">`,
            `<input type="text" class="editable-input file-name-cell" value="">`
        ];

        if (mainTableInstance) {
            mainTableInstance.row.add(newRowData).draw();
        }
    }

    function resetUploadForm() {
        $('#uploadModal .error-field').removeClass('error-field success-field');
        $('#uploadModal .error-message').removeClass('show');

        $('#fileName, #fileNumber').val('');
        $('#folder, #subFolder, #department, #currentStatus').val('');
        $('#singleFileInput').val('');
        $('#revisionDate').val('');
        $('#revisionNo').val('R01');

        resetBulkUploadForm();
        uploadedMetadataFile = null;
        uploadedZipFile = null;

        $('#uploadModal .upload-tab').removeClass('active');
        $('#uploadModal .upload-tab[data-tab="single"]').addClass('active');
        $('.single-upload-options, .bulk-upload-options').removeClass('active');
        $('#singleUploadTab').addClass('active');
    }

    function showSendDocumentsModal() {
        resetSendForm();

        if (selectedDocument) {
            const attachmentItem = `
                        <div class="attachment-item">
                            <span>${selectedDocument.fileName} (${selectedDocument.fileType})</span>
                            <button type="button" onclick="removeAttachment(this)" style="background: #e53e3e; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer;">×</button>
                        </div>
                    `;
            $('#attachmentsList').html(attachmentItem);
        }

        $('#sendDocumentsModal').css('display', 'flex');
    }

    function showUpdateDocumentsModal() {
        resetUpdateForm();

        $('#updateDocumentsModal .upload-tab').removeClass('active');
        $('#updateDocumentsModal .upload-tab[data-tab="single"]').addClass('active');
        $('.single-update-options, .bulk-update-options').removeClass('active');
        $('#singleUpdateTab').addClass('active');

        if (selectedDocument) {
            $('#updateFileName').val(selectedDocument.fileName);
            $('#updateFileNumber').val(selectedDocument.fileNumber);
            $('#updateRevisionNo').val(selectedDocument.revisionNo);

            if (selectedDocument.revisionDate) {
                const dateParts = selectedDocument.revisionDate.split('.');
                if (dateParts.length === 3) {
                    const formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
                    $('#updateRevisionDate').val(formattedDate);
                }
            }

            $('#updateCurrentStatus').val(selectedDocument.status);
            $('#updateDepartment').val(selectedDocument.department);
            $('#updateFolder').val(selectedDocument.folder);

            // Update sub-folder options and set value
            updateSubFolderOptions('#updateFolder', '#updateSubFolder');
            setTimeout(() => {
                $('#updateSubFolder').val(selectedDocument.subFolder);
            }, 100);

            const currentDocumentItem = `
                        <div class="current-document-item">
                            <div class="document-info">
                                <div class="document-name">${selectedDocument.fileName}</div>
                                <div class="document-details">
                                    File Number: ${selectedDocument.fileNumber} | 
                                    Revision: ${selectedDocument.revisionNo} | 
                                    Status: ${selectedDocument.status} | 
                                    Department: ${selectedDocument.department} |
                                    Folder: ${selectedDocument.folder} |
                                    Sub-Folder: ${selectedDocument.subFolder}
                                </div>
                            </div>
                            <span class="file-type-badge">${selectedDocument.fileType}</span>
                        </div>
                    `;
            $('#currentDocumentInfo').html(currentDocumentItem);
        }

        $('#updateDocumentsModal').css('display', 'flex');
    }

    function resetSendForm() {
        $('#sendDocumentsModal .error-field').removeClass('error-field success-field');
        $('#sendDocumentsModal .error-message').removeClass('show');

        $('#sendTo, #sendCc, #sendSubject, #sendReason').val('');
        $('#responseExpected').val('');
        $('#targetResponseDate').val('');
        $('#attachmentsList').empty();
    }

    function resetUpdateForm() {
        $('#updateDocumentsModal .error-field').removeClass('error-field success-field');
        $('#updateDocumentsModal .error-message').removeClass('show');

        $('#updateFileName, #updateFileNumber, #updateRevisionNo, #updateReason').val('');
        $('#updateRevisionDate').val('');
        $('#updateFolder, #updateSubFolder, #updateDepartment, #updateCurrentStatus').val('');
        $('#updateDocumentFile').val('');
        $('#currentDocumentInfo').empty();

        resetBulkUpdateForm();
        updateUploadedMetadataFile = null;
        updateUploadedZipFile = null;
    }

    function showPreviewMetadata() {
        $('#previewFileName, #previewFileNumber').val('');
        $('#previewFolder, #previewSubFolder, #previewDepartment, #previewCurrentStatus').val('');
        $('#previewRevisionDate').val('');

        $('#previewModal input, #previewModal select').addClass('error-field');
        $('#previewModal .error-message').addClass('show');

        $('#previewModal').css('display', 'flex');
    }

    function showUploadedFile(fileType, fileName) {
        if (fileType === 'metadata') {
            $('#metadataFileName').text(fileName);
            $('#metadataStatus').show();
        } else if (fileType === 'zip') {
            $('#zipFileName').text(fileName);
            $('#zipStatus').show();
        }
    }

    function removeUploadedFile(fileType) {
        if (fileType === 'metadata') {
            $('#metadataStatus').hide();
            $('#metadataFileName').text('');
            uploadedMetadataFile = null;
        } else if (fileType === 'zip') {
            $('#zipStatus').hide();
            $('#zipFileName').text('');
            uploadedZipFile = null;
        }
    }

    function showUpdateUploadedFile(fileType, fileName) {
        if (fileType === 'update-metadata') {
            $('#updateMetadataFileName').text(fileName);
            $('#updateMetadataStatus').show();
        } else if (fileType === 'update-zip') {
            $('#updateZipFileName').text(fileName);
            $('#updateZipStatus').show();
        }
    }

    function removeUpdateUploadedFile(fileType) {
        if (fileType === 'update-metadata') {
            $('#updateMetadataStatus').hide();
            $('#updateMetadataFileName').text('');
            updateUploadedMetadataFile = null;
        } else if (fileType === 'update-zip') {
            $('#updateZipStatus').hide();
            $('#updateZipFileName').text('');
            updateUploadedZipFile = null;
        }
    }

    function resetBulkUploadForm() {
        $('#metadataStatus, #zipStatus').hide();
        $('#metadataFileName, #zipFileName').text('');
        uploadedMetadataFile = null;
        uploadedZipFile = null;
    }

    // Utility functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function getFileTypeClass(extension) {
        switch (extension) {
            case 'pdf': return 'file-type-pdf';
            case 'doc':
            case 'docx': return 'file-type-word';
            case 'xls':
            case 'xlsx': return 'file-type-excel';
            case 'dwg': return 'file-type-dwg';
            case 'jpg':
            case 'jpeg': return 'file-type-jpeg';
            default: return 'file-type-pdf';
        }
    }

    function getCurrentDateString() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${day}.${month}.${year}`;
    }

    function formatDateForDisplay(dateString) {
        if (dateString && dateString.includes('-')) {
            const parts = dateString.split('-');
            if (parts.length === 3) {
                return `${parts[2].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[0]}`;
            }
        }
        return dateString;
    }

    // Global function for removing attachments (called from HTML)
    window.removeAttachment = function (button) {
        $(button).parent().remove();
    };

    // Navigation functionality
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', function () {
            const targetPage = this.getAttribute('data-target');
            if (targetPage) {
                window.location.href = targetPage;
            }
        });
    });

    document.querySelectorAll('.sidebar-header[data-target]').forEach(item => {
        item.addEventListener('click', function () {
            const target = this.getAttribute('data-target');
            if (target) {
                window.location.href = target;
            }
        });
    });

    // Enhanced Column Filter System
    function getColumnData(columnIndex) {
        const uniqueValues = new Set();

        $('#mainTable tbody tr:visible').each(function () {
            const cell = $(this).find('td').eq(columnIndex);
            let value = '';

            const input = cell.find('input, select');
            if (input.length) {
                value = input.val() || input.text();
            } else {
                value = cell.text().trim();
            }

            if (value && value !== '') {
                uniqueValues.add(value);
            }
        });

        return Array.from(uniqueValues).sort();
    }

    function createFilterDropdown(columnIndex) {
        const dropdown = $(`.filter-dropdown[data-column="${columnIndex}"]`);
        dropdown.empty();

        dropdown.append(`
                    <input type="text" class="filter-search" placeholder="Search options...">
                    <div class="filter-options"></div>
                `);

        const uniqueValues = new Set();
        $('#mainTable tbody tr').each(function () {
            const cell = $(this).find('td').eq(columnIndex);
            let value = cell.find('input').length ? cell.find('input').val() : cell.text();
            value = value.trim();
            if (value) uniqueValues.add(value);
        });

        const optionsContainer = dropdown.find('.filter-options');
        Array.from(uniqueValues).sort().forEach((value, idx) => {
            const checked = (columnFilters[columnIndex] || []).includes(value) ? 'checked' : '';
            optionsContainer.append(`
                        <div class="filter-option">
                            <input type="checkbox" class="filter-checkbox" data-column="${columnIndex}" value="${value}" id="filter${columnIndex}_${idx}" ${checked}>
                            <label for="filter${columnIndex}_${idx}">${value}</label>
                        </div>
                    `);
        });
    }

    // Toggle dropdown on ▼ click
    $(document).on('click', '.filter-dropdown-toggle', function (e) {
        e.stopPropagation();
        const container = $(this).closest('.filter-container');
        const dropdown = container.find('.filter-dropdown');
        $('.filter-dropdown').not(dropdown).removeClass('show');
        dropdown.toggleClass('show');
        const columnIndex = $(this).siblings('.column-filter').data('column');
        createFilterDropdown(columnIndex);
    });

    // Hide dropdown when clicking outside
    $(document).on('click', function () {
        $('.filter-dropdown').removeClass('show');
    });

    // Prevent dropdown from closing when clicking inside
    $(document).on('click', '.filter-dropdown', function (e) {
        e.stopPropagation();
    });

    // Handle checkbox change
    $(document).on('change', '.filter-checkbox', function () {
        const columnIndex = $(this).data('column');
        columnFilters[columnIndex] = [];
        $(`.filter-dropdown[data-column="${columnIndex}"] .filter-checkbox:checked`).each(function () {
            columnFilters[columnIndex].push($(this).val());
        });
        updateFilterInput(columnIndex);
        applyColumnFilters();
    });

    // Update filter input display
    function updateFilterInput(columnIndex) {
        const input = $(`.column-filter[data-column="${columnIndex}"]`);
        const selected = columnFilters[columnIndex] || [];
        if (selected.length === 0) {
            input.val('');
        } else if (selected.length === 1) {
            input.val(selected[0]);
        } else {
            input.val(`${selected.length} selected`);
        }
    }

    // Filter table rows
    function applyColumnFilters() {
        $('#mainTable tbody tr').each(function () {
            let show = true;
            $(this).find('td').each(function (colIdx) {
                if (columnFilters[colIdx] && columnFilters[colIdx].length > 0) {
                    let cellValue = $(this).find('input').length ? $(this).find('input').val() : $(this).text();
                    cellValue = cellValue.trim();
                    if (!columnFilters[colIdx].includes(cellValue)) {
                        show = false;
                    }
                }
            });
            $(this).toggle(show);
        });
    }

    function updateAllColumnFilters() {
        // This function can be called when table is redrawn
    }

    // Prevent typing in filter input
    $(document).on('keydown', '.column-filter', function (e) {
        e.preventDefault();
    });

    // Filter dropdown options as user types in the search box
    $(document).on('input', '.filter-search', function () {
        const searchTerm = $(this).val().toLowerCase();
        const options = $(this).siblings('.filter-options').find('.filter-option');
        options.each(function () {
            const label = $(this).find('label').text().toLowerCase();
            $(this).toggle(label.includes(searchTerm));
        });
    });

    // Right-click or context menu logic should store the row
    $('#mainTable').on('contextmenu', 'tr', function (e) {
        e.preventDefault();
        currentUpdateRow = $(this);
        $('#contextMenu').css({ top: e.pageY, left: e.pageX, display: 'block' });
        $('#contextMenu').data('row', currentUpdateRow);
    });

    // When clicking "Update" in the context menu
    $(document).on('click', '.context-menu-item[data-action="update"]', function () {
        const $row = $('#contextMenu').data('row');
        if (!$row) return;
        currentUpdateRow = $row;

        // Autofill form fields from table row with updated column positions
        $('#updateFileName').val($row.find('td').eq(2).find('input').val());
        $('#updateFileNumber').val($row.find('td').eq(1).find('input').val());
        $('#updateRevisionNo').val($row.find('td').eq(3).find('input').val());
        $('#updateRevisionDate').val($row.find('td').eq(10).find('input').val());
        $('#updateFolder').val($row.find('td').eq(6).find('input').val());
        $('#updateDepartment').val($row.find('td').eq(11).find('input').val());
        $('#updateCurrentStatus').val($row.find('td').eq(4).find('input').val());

        // Update sub-folder options and set value
        updateSubFolderOptions('#updateFolder', '#updateSubFolder');
        setTimeout(() => {
            $('#updateSubFolder').val($row.find('td').eq(7).find('input').val());
        }, 100);

        $('#updateDocumentsModal').addClass('show');
        $('#contextMenu').hide();
    });

    $('#previewUpdateMetadata').on('click', function () {
        if (!$('#updateMetadataFileName').text()) {
            alert('Please upload a metadata file before preview.');
            return;
        }
        showPreviewMetadata();
    });
});