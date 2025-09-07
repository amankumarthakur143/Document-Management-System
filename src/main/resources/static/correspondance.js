// Sidebar navigation
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', function () {
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// Storage for uploaded letters data
let lettersData = {};
let letterCounter = 1;
let currentAttachMode = false; // Track if we're in attach mode
let attachToLetterNo = null; // Track which letter we're attaching to

// Upload Modal Elements
const uploadBtn = document.getElementById('uploadBtn');
const uploadModal = document.getElementById('uploadModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const sendBtn = document.getElementById('sendBtn');
const saveAsDraftBtn = document.getElementById('saveAsDraftBtn');
const addAttachmentBtn = document.getElementById('addAttachmentBtn');
const attachmentInput = document.getElementById('attachmentInput');
const attachmentsList = document.getElementById('attachmentsList');

// Letter Details Modal Elements
const letterDetailsModal = document.getElementById('letterDetailsModal');
const closeLetterModal = document.getElementById('closeLetterModal');
const attachBtn = document.getElementById('attachBtn');
const replyBtn = document.getElementById('replyBtn');
const cancelDetailBtn = document.getElementById('cancelDetailBtn');

// Open upload modal
uploadBtn.addEventListener('click', function () {
    currentAttachMode = false;
    attachToLetterNo = null;
    updateModalForMode();
    uploadModal.style.display = 'block';
});

// Function to update modal based on mode (normal upload vs attach)
function updateModalForMode() {
    const modalHeader = document.querySelector('.upload-modal-header');
    const sendButton = document.getElementById('sendBtn');
    const draftButton = document.getElementById('saveAsDraftBtn');
    
    if (currentAttachMode) {
        modalHeader.innerHTML = `Attach to Letter - ${attachToLetterNo} <span class="close" id="closeModal">&times;</span>`;
        sendButton.textContent = 'Attach';
        draftButton.style.display = 'none'; // Hide draft button in attach mode
    } else {
        modalHeader.innerHTML = `Upload Letter <span class="close" id="closeModal">&times;</span>`;
        sendButton.textContent = 'Send';
        draftButton.style.display = 'inline-block'; // Show draft button in normal mode
    }
    
    // Re-attach close event listener since we changed the HTML
    document.getElementById('closeModal').addEventListener('click', closeUploadModal);
}

// Close upload modal
function closeUploadModal() {
    uploadModal.style.display = 'none';
    document.getElementById('uploadForm').reset();
    attachmentsList.innerHTML = '';
    currentAttachMode = false;
    attachToLetterNo = null;
}

closeModal.addEventListener('click', closeUploadModal);
cancelBtn.addEventListener('click', closeUploadModal);

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    if (event.target === uploadModal) {
        closeUploadModal();
    }
    if (event.target === letterDetailsModal) {
        closeLetterDetailsModal();
    }
});

// Add attachment functionality for upload modal
addAttachmentBtn.addEventListener('click', function () {
    attachmentInput.click();
});

attachmentInput.addEventListener('change', function (e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        addAttachmentToList(file);
    });
});

function addAttachmentToList(file) {
    const attachmentItem = document.createElement('div');
    attachmentItem.className = 'attachment-item';

    const fileExtension = file.name.split('.').pop().toUpperCase();
    const fileSize = (file.size / 1024).toFixed(1) + ' KB';

    attachmentItem.innerHTML = `
                <div class="attachment-icon">${fileExtension}</div>
                <div class="attachment-info">
                    <div class="attachment-name">${file.name}</div>
                    <div class="attachment-size">${fileSize}</div>
                </div>
                <button type="button" class="remove-attachment" onclick="removeAttachment(this)">×</button>
            `;

    attachmentsList.appendChild(attachmentItem);
}

function removeAttachment(button) {
    button.parentElement.remove();
}

// Function to add letter to table
function addLetterToTable(letterData) {
    const tableBody = document.getElementById('documentTableBody');

    // Find first empty row or create new one
    let targetRow = Array.from(tableBody.rows).find(row => {
        const letterNoCell = row.cells[2];
        const input = letterNoCell.querySelector('input');
        return !input.value;
    });

    if (!targetRow) {
        // Create new row if no empty row found
        targetRow = tableBody.insertRow();
        for (let i = 0; i < 11; i++) {
            const cell = targetRow.insertCell();
            if (i === 0) {
                cell.innerHTML = '<span class="file-type-label file-type-pdf"></span>';
            } else {
                cell.innerHTML = '<input type="text" class="editable-input" value="">';
            }
        }
    }

    // Fill the row with letter data
    const cells = targetRow.cells;

    // Type (first cell) - determine file type from attachments or default to PDF
    const fileType = letterData.attachments && letterData.attachments.length > 0
        ? letterData.attachments[0].type.toUpperCase()
        : 'PDF';
    cells[0].innerHTML = `<span class="file-type-label">${fileType}</span>`;

    // Fill other cells
    cells[1].querySelector('input').value = letterData.category || '';

    // Letter No. - make it clickable
    cells[2].innerHTML = `<span class="letter-no-link" onclick="openLetterDetails('${letterData.letterNo}')">${letterData.letterNo}</span>`;

    cells[3].querySelector('input').value = letterData.fromField || 'System'; // Default sender
    cells[4].querySelector('input').value = letterData.toField || '';
    cells[5].querySelector('input').value = letterData.subject || '';
    cells[6].querySelector('input').value = letterData.requiredResponse || '';
    cells[7].querySelector('input').value = letterData.dueDate || '';
    cells[8].querySelector('input').value = letterData.currentStatus || '';
    cells[9].querySelector('input').value = letterData.department || 'General'; // Default department
    cells[10].querySelector('input').value = letterData.attachments ? letterData.attachments.length : '0';
}

// Form submission - Send/Attach
sendBtn.addEventListener('click', function () {
    if (currentAttachMode) {
        // Handle attachment mode
        const attachments = getAttachmentsFromForm();
        if (attachments.length === 0) {
            alert('Please select at least one file to attach');
            return;
        }
        
        // Add attachments to existing letter
        if (lettersData[attachToLetterNo]) {
            if (!lettersData[attachToLetterNo].attachments) {
                lettersData[attachToLetterNo].attachments = [];
            }
            lettersData[attachToLetterNo].attachments.push(...attachments);
            
            alert('Files attached successfully!');
            closeUploadModal();
            
            // Refresh the letter details modal to show new attachments
            setTimeout(() => {
                openLetterDetails(attachToLetterNo);
            }, 100);
        }
    } else {
        // Handle normal send mode
        const formData = getFormData();
        if (validateForm(formData)) {
            formData.currentStatus = 'Sent';
            saveLetterData(formData);
            addLetterToTable(formData);
            closeUploadModal();
        }
    }
});

// Form submission - Save as Draft
// saveAsDraftBtn.addEventListener('click', function () {
//     const formData = getFormData();
//     if (formData.letterNo) {
//         formData.currentStatus = 'Draft';
//         saveLetterData(formData);
//         addLetterToTable(formData);
//         closeUploadModal();
//     } else {
//         alert('Please enter at least a Letter Number');
//     }
// });

// Get attachments from form
function getAttachmentsFromForm() {
    return Array.from(attachmentsList.children)
        .filter(item => item.classList.contains('attachment-item'))
        .map(item => ({
            name: item.querySelector('.attachment-name').textContent,
            size: item.querySelector('.attachment-size').textContent,
            type: item.querySelector('.attachment-icon').textContent
        }));
}

// Get form data
function getFormData() {
    const attachments = getAttachmentsFromForm();

    return {
        category: document.getElementById('category').value,
        letterNo: document.getElementById('letterNo').value,
        letterDate: document.getElementById('letterDate').value,
        fromField: '', // Set default value since field is removed from HTML
        toField: document.getElementById('toField').value,
        ccField: document.getElementById('ccField').value,
        department: '', // Set default value since field is removed from HTML
        referenceLetters: document.getElementById('referenceLetters').value,
        subject: document.getElementById('subject').value,
        keyInformation: document.getElementById('keyInformation').value,
        requiredResponse: document.getElementById('requiredResponse').value,
        dueDate: document.getElementById('dueDate').value,
        currentStatus: document.getElementById('currentStatus').value,
        attachments: attachments
    };
}

// Validate form
function validateForm(formData) {
    if (!formData.letterNo) {
        alert('Please enter a Letter Number');
        return false;
    }
    if (lettersData[formData.letterNo]) {
        alert('Letter Number already exists. Please use a different number.');
        return false;
    }
    return true;
}

// Save letter data to storage with sample reference letters
function saveLetterData(formData) {
    // Add sample reference letters for demonstration
    formData.referenceLetters = [
        'MRVC-MVR-009',
        'MRVC-MVR-008'
    ];
    lettersData[formData.letterNo] = formData;
}

// Open letter details modal
function openLetterDetails(letterNo) {
    const data = lettersData[letterNo];
    if (!data) {
        alert('Letter data not found');
        return;
    }

    // Fill form with data
    document.getElementById('modalLetterNo').textContent = letterNo;
    document.getElementById('detailCategory').value = data.category || '';
    document.getElementById('detailStatus').value = data.currentStatus || '';
    document.getElementById('detailLetterNo').value = data.letterNo || '';
    document.getElementById('detailLetterDate').value = data.letterDate || '';
    document.getElementById('detailFromField').value = data.fromField || '';
    document.getElementById('detailToField').value = data.toField || '';
    document.getElementById('detailCcField').value = data.ccField || '';
    document.getElementById('detailDepartment').value = data.department || '';

    // Load reference letters
    loadReferenceLetters(data.referenceLetters || []);

    document.getElementById('detailSubject').value = data.subject || '';
    document.getElementById('detailKeyInformation').value = data.keyInformation || '';
    document.getElementById('detailRequiredResponse').value = data.requiredResponse || '';
    document.getElementById('detailDueDate').value = data.dueDate || '';

    // Load attachments for viewing only
    loadAttachmentsForViewing(data.attachments || []);

    // Show modal
    letterDetailsModal.style.display = 'flex';
}

// Load reference letters
function loadReferenceLetters(referenceLetters) {
    const referenceLettersList = document.getElementById('referenceLettersList');
    referenceLettersList.innerHTML = '';

    if (referenceLetters.length === 0) {
        referenceLettersList.innerHTML = '<div style="color: #666; font-style: italic;">No reference letters</div>';
        return;
    }

    referenceLetters.forEach((refLetter, index) => {
        const referenceItem = document.createElement('div');
        referenceItem.className = 'reference-letter-item';
        referenceItem.innerHTML = `
                    <span class="reference-letter-number">${index + 1}.</span>
                    <span class="reference-letter-link" onclick="openReferenceLetterDetails('${refLetter}')">${refLetter}</span>
                `;
        referenceLettersList.appendChild(referenceItem);
    });
}

// Load attachments for viewing only
function loadAttachmentsForViewing(attachments) {
    const seeAttachmentsList = document.getElementById('seeAttachmentsList');
    seeAttachmentsList.innerHTML = '';

    if (attachments.length === 0) {
        seeAttachmentsList.innerHTML = '<div style="color: #666; font-style: italic;">No attachments</div>';
        return;
    }

    attachments.forEach(attachment => {
        const attachmentItem = document.createElement('div');
        attachmentItem.className = 'attachment-view-item';
        attachmentItem.innerHTML = `
                    <div class="attachment-icon">${attachment.type}</div>
                    <div class="attachment-info">
                        <div class="attachment-name">${attachment.name}</div>
                        <div class="attachment-size">${attachment.size}</div>
                    </div>
                    <button type="button" class="view-attachment" onclick="viewAttachment('${attachment.name}')">View</button>
                `;
        seeAttachmentsList.appendChild(attachmentItem);
    });
}

// Open reference letter details
function openReferenceLetterDetails(refLetterNo) {
    alert('Opening reference letter: ' + refLetterNo);
    // In real implementation, this would open the reference letter details
}

// Close letter details modal
function closeLetterDetailsModal() {
    letterDetailsModal.style.display = 'none';
}

closeLetterModal.addEventListener('click', closeLetterDetailsModal);
cancelDetailBtn.addEventListener('click', closeLetterDetailsModal);

// Attach button functionality - UPDATED
attachBtn.addEventListener('click', function () {
    const letterNo = document.getElementById('detailLetterNo').value;
    
    // Close the letter details modal
    closeLetterDetailsModal();
    
    // Set attach mode
    currentAttachMode = true;
    attachToLetterNo = letterNo;
    
    // Open upload modal in attach mode
    setTimeout(() => {
        updateModalForMode();
        uploadModal.style.display = 'block';
        
        // Clear form but keep it disabled for attachment mode
        document.getElementById('uploadForm').reset();
        
        // Disable form fields in attach mode (optional - you can remove this if you want all fields editable)
        const formElements = document.querySelectorAll('#uploadForm input, #uploadForm select, #uploadForm textarea');
        formElements.forEach(element => {
            if (element.id !== 'attachmentInput') {
                element.disabled = currentAttachMode;
            }
        });
        
    }, 100);
});

// Reply button functionality
replyBtn.addEventListener('click', function () {
    const letterNo = document.getElementById('detailLetterNo').value;
    const fromField = document.getElementById('detailFromField').value;
    const subject = document.getElementById('detailSubject').value;

    // Close current modal
    closeLetterDetailsModal();

    // Set normal mode
    currentAttachMode = false;
    attachToLetterNo = null;

    // Open upload modal with pre-filled reply data
    setTimeout(() => {
        updateModalForMode();
        uploadModal.style.display = 'block';

        // Pre-fill reply data
        document.getElementById('toField').value = fromField;
        document.getElementById('subject').value = 'RE: ' + subject;
        document.getElementById('referenceLetters').value = letterNo;

        // Auto-generate reply letter number
        const replyLetterNo = 'RE-' + letterNo + '-' + String(Date.now()).slice(-4);
        document.getElementById('letterNo').value = replyLetterNo;

        // Set current date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('letterDate').value = today;

        // Enable all form fields for reply mode
        const formElements = document.querySelectorAll('#uploadForm input, #uploadForm select, #uploadForm textarea');
        formElements.forEach(element => {
            element.disabled = false;
        });

    }, 100);
});

// View attachment
function viewAttachment(fileName) {
    alert('Opening attachment: ' + fileName);
    // In real implementation, this would open/download the file
}

// Make functions global
window.openLetterDetails = openLetterDetails;
window.viewAttachment = viewAttachment;
window.openReferenceLetterDetails = openReferenceLetterDetails;

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


//Search and Filter functionality

$(document).ready(function () {
    // Function to highlight search matches in plain text cells
    function highlightText(text, term) {
        if(!term) return text;
        var reg = new RegExp('('+term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')+')', 'gi');
        return text.replace(reg, '<span class="highlight">$1</span>');
    }

    // Filtering logic + highlight
    $('.column-filter').on('input', function(){
        var $inputs = $('.filter-row .column-filter');
        var filterVals = [];
        $inputs.each(function(i, input){
            filterVals.push($(input).val().trim());
        });

        $('.document-table tbody tr').each(function(){
            var $row = $(this);
            var show = true;

            $row.find('td').each(function(i, cell){
                var filter = filterVals[i];
                var $input = $(cell).find('input');
                if ($input.length) {
                    // Cell has input field (do not destroy input)
                    var val = $input.val() || "";
                    $input.removeClass('highlight');
                    if(filter.length > 0) {
                        if(val.toLowerCase().indexOf(filter.toLowerCase()) === -1) {
                            show = false;
                        }
                    }
                } else {
                    // Plain text cell
                    var cellText = $(cell).text();
                    // Remove highlight
                    $(cell).html($(cell).text());
                    if(filter.length > 0) {
                        if(cellText.toLowerCase().indexOf(filter.toLowerCase()) === -1) {
                            show = false;
                        }
                    }
                }
            });

            $row.toggle(show);

            // Highlight only if showing
            if(show){
                $row.find('td').each(function(i, cell){
                    var filter = filterVals[i];
                    var $input = $(cell).find('input');
                    if ($input.length) {
                        // Input highlight with background color
                        var val = $input.val() || "";
                        if(filter.length > 0 && val.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
                            $input.addClass('highlight');
                        } else {
                            $input.removeClass('highlight');
                        }
                    } else {
                        if(filter.length > 0){
                            // Highlight plain text
                            var cellText = $(cell).text();
                            $(cell).html(highlightText(cellText, filter));
                        }
                    }
                });
            }
        });
    });
});


// Save Draft functionality

function addDraftToDraftTable(draftData) {
    // Format dates
    let letterDateFormatted = '';
    if (draftData.letterDate) {
        const dt = new Date(draftData.letterDate);
        if (!isNaN(dt)) {
            letterDateFormatted = dt.toLocaleDateString('en-GB');
        }
    }
    let dueDateFormatted = '';
    if (draftData.dueDate) {
        const dt = new Date(draftData.dueDate);
        if (!isNaN(dt)) {
            dueDateFormatted = dt.toLocaleDateString('en-GB');
        }
    }

    // Use DataTables API to add row
    const draftTable = $('#draftTable').DataTable();
    draftTable.row.add([
        draftData.category || '',
        draftData.letterNo || '',
        letterDateFormatted,
        draftData.toField || '',
        draftData.ccField || '',
        Array.isArray(draftData.referenceLetters) ? draftData.referenceLetters.join(', ') : (draftData.referenceLetters || ''),
        draftData.subject || '',
        draftData.requiredResponse || '',
        dueDateFormatted,
        draftData.currentStatus || '',
        draftData.attachments ? draftData.attachments.length : '0'
    ]).draw(false);
}

document.getElementById('draftBtn').addEventListener('click', function () {
    document.getElementById('mainTableContainer').style.display = 'none';
    document.getElementById('draftTableContainer').style.display = 'block';
    document.getElementById('backToMainBtn').style.display = 'inline-block';

});

document.getElementById('backToMainBtn').addEventListener('click', function () {
    document.getElementById('draftTableContainer').style.display = 'none';
    document.getElementById('mainTableContainer').style.display = 'block';
    this.style.display = 'none';
});


// Save as Draft button functionality

saveAsDraftBtn.addEventListener('click', function () {
    const formData = getFormData();

    if (!formData.letterNo) {
        alert('Please enter at least a Letter Number');
        return;
    }

    // Mark status as Draft
    formData.currentStatus = 'Draft';

    // Save to your storage object (if any)
    saveLetterData(formData);

    // Add to main documents table if you want:
    addLetterToTable(formData); // optional

    // IMPORTANT: Add draft data to drafts table
    addDraftToDraftTable(formData);

    // Close modal & reset
    closeUploadModal();
});


// Initialize DataTable for document table

$(document).ready(function() {
    $('#mainTable').DataTable({
        // Optional: Customize language to match your image more closely!
        "language": {
            "lengthMenu": "Show _MENU_ entries",
            "info": "Showing _START_ to _END_ of _TOTAL_ entries"
        },
        // Optional: Initial page length
        "pageLength": 10
    });
});


$(document).ready(function() {
    $('#draftTable').DataTable({
        "language": {
            "lengthMenu": "Show _MENU_ entries",
            "info": "Showing _START_ to _END_ of _TOTAL_ entries"
        },
        "pageLength": 10
    });
});


//multi-checkbox functionality

$(document).ready(function () {
    // Global variables
    let mainTableInstance = null;
    let columnFilters = {}; // Store selected filters for each column

    // Initialize DataTable
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
                    // Update filter dropdowns after table redraw
                    updateAllColumnFilters();
                }
            });
        }
    }

    // Enhanced Column Filter System
    function getColumnData(columnIndex) {
        const uniqueValues = new Set();

        $('#mainTable tbody tr:visible').each(function () {
            const cell = $(this).find('td').eq(columnIndex);
            let value = '';

            // Check if cell contains an input field
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

        // Add search box
        dropdown.append(`
        <input type="text" class="filter-search" placeholder="Search options...">
        <div class="filter-options"></div>
    `);

        // Get unique values from the column
        const uniqueValues = new Set();
        $('#mainTable tbody tr').each(function () {
            const cell = $(this).find('td').eq(columnIndex);
            let value = cell.find('input').length ? cell.find('input').val() : cell.text();
            value = value.trim();
            if (value) uniqueValues.add(value);
        });

        // Add checkboxes (all unchecked by default)
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
        // Create dropdown content each time it's opened
        const columnIndex = $(this).siblings('.column-filter').data('column');
        createFilterDropdown(columnIndex);
    });

    // Hide dropdown when clicking outside
    $(document).on('click', function () {
        $('.filter-dropdown').removeClass('show');
    });

    // Prevent dropdown from closing when clicking inside the dropdown (including search box)
    $(document).on('click', '.filter-dropdown', function(e) {
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
        // Show your context menu here...
        $('#contextMenu').css({ top: e.pageY, left: e.pageX, display: 'block' });
        $('#contextMenu').data('row', currentUpdateRow);
    });

    // When clicking "Update" in the context menu
    $(document).on('click', '.context-menu-item[data-action="update"]', function () {
        const $row = $('#contextMenu').data('row');
        if (!$row) return;

        // Autofill form fields from table row (adjust .eq() as per your table structure)
        $('#updateFileName').val($row.find('td').eq(2).find('input').val());
        $('#updateFileNumber').val($row.find('td').eq(1).find('input').val());
        $('#updateRevisionNo').val($row.find('td').eq(3).find('input').val());
        $('#updateRevisionDate').val($row.find('td').eq(8).find('input').val());
        $('#updateCategory').val($row.find('td').eq(5).find('input').val());
        $('#updateSubCategory').val(""); // Set if you have this in your table
        $('#updateDepartment').val($row.find('td').eq(9).find('input').val());
        $('#updateCurrentStatus').val($row.find('td').eq(4).find('input').val());
        $('#updateReason').val(""); // Set if you have this in your table

        $('#updateDocumentsModal').addClass('show');
        $('#contextMenu').hide();
    });

    // Hide Update Documents Modal when Cancel is clicked
    $('#cancelUpdate').on('click', function () {
        $('#updateDocumentsModal').removeClass('show');
        currentUpdateRow = null;
    });

    // Optional: Hide modal when clicking outside modal-content
    $('#updateDocumentsModal').on('click', function (e) {
        if ($(e.target).is('#updateDocumentsModal')) {
            $('#updateDocumentsModal').removeClass('show');
            currentUpdateRow = null;
        }
    });
});

$(document).ready(function () {
    $('#saveAsDraftBtn').on('click', function () {
        // You can collect form data here if needed
        // For now, just close the modal and show a notification

        $('#uploadModal').removeClass('show');
        $('#uploadModal').hide(); // In case you use .show()/.hide() elsewhere

        // Optionally, reset the form
        $('#uploadForm')[0].reset();

        // Optionally, show a notification (implement showNotification if you want)
        // showNotification('Draft saved successfully!', 'success');
        alert('Draft saved successfully!');
    });
});

function updateDraftCount() {
    const draftTable = $('#draftTable').DataTable();
    const count = draftTable.rows().count();
    // Update your badge or count element, e.g.:
    $('#draftCount').text(count);
}
