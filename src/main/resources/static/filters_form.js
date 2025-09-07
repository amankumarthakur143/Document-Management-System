//// Data storage
//let specializationData = [
//    { name: "Engineering", count: 0 },
//    { name: "Construction", count: 0 },
//    { name: "Quality", count: 0 },
//    { name: "Safety", count: 0 },
//    { name: "Others", count: 0 },
//];
//
//let contractData = [
//    { name: "Draft" },
//    { name: "Review" },
//    { name: "Final" },
//    { name: "Superseded" },
//];
//
//let folderData = [
//    { name: "Documents", subfolders: ["Contracts", "Reports", "Specifications"] },
//    { name: "Engineering", subfolders: ["Drawings", "Calculations", "Standards"] },
//    { name: "Safety", subfolders: ["Procedures", "Training", "Incidents"] },
//];
//
//let editingSpecializationIndex = null;
//let editingContractIndex = null;
//let editingFolderIndex = null;
//let currentSubfolders = [];
//
//// Modal functions
//function openModal(modalId) {
//    document.getElementById(modalId).style.display = 'block';
//
//    if (modalId === 'folderModal') {
//        currentSubfolders = [];
//        updateSubfolderDisplay();
//    }
//}
//
//function closeModal(modalId) {
//    document.getElementById(modalId).style.display = 'none';
//    editingSpecializationIndex = null;
//    editingContractIndex = null;
//    editingFolderIndex = null;
//    deletingFolderIndex = null;
//    currentSubfolders = [];
//
//    // Reset form titles
//    if (modalId === 'specializationModal') {
//        document.getElementById('specializationModalTitle').textContent = 'Add Department';
//    } else if (modalId === 'contractModal') {
//        document.getElementById('contractModalTitle').textContent = 'Add Status';
//    } else if (modalId === 'folderModal') {
//        document.getElementById('folderModalTitle').textContent = 'Add Folder';
//        document.getElementById('folderForm').reset();
//        updateSubfolderDisplay();
//    }
//}
//
//// Clear search function
//function clearSearch(inputId) {
//    document.getElementById(inputId).value = '';
//    filterTable(inputId);
//}
//
//// Search functionality
//function filterTable(inputId) {
//    const input = document.getElementById(inputId);
//    const filter = input.value.toUpperCase();
//    let tableId;
//
//    if (inputId.includes('specialization')) {
//        tableId = 'specializationTableBody';
//    } else if (inputId.includes('contract')) {
//        tableId = 'contractTableBody';
//    } else if (inputId.includes('folder')) {
//        tableId = 'folderTableBody';
//    }
//
//    const table = document.getElementById(tableId);
//    const rows = table.getElementsByTagName('tr');
//
//    for (let i = 0; i < rows.length; i++) {
//        const cells = rows[i].getElementsByTagName('td');
//        let found = false;
//        for (let j = 0; j < cells.length - 1; j++) {
//            if (cells[j].textContent.toUpperCase().indexOf(filter) > -1) {
//                found = true;
//                break;
//            }
//        }
//        rows[i].style.display = found ? '' : 'none';
//    }
//}
//
//// Sort table function
//function sortTable(columnIndex, tableType) {
//    let tableId;
//    if (tableType === 'specialization') {
//        tableId = 'specializationTableBody';
//    } else if (tableType === 'contract') {
//        tableId = 'contractTableBody';
//    } else if (tableType === 'folder') {
//        tableId = 'folderTableBody';
//    }
//
//    const table = document.getElementById(tableId);
//    const rows = Array.from(table.rows);
//
//    rows.sort((a, b) => {
//        const aText = a.cells[columnIndex].textContent.trim();
//        const bText = b.cells[columnIndex].textContent.trim();
//        return aText.localeCompare(bText);
//    });
//
//    rows.forEach(row => table.appendChild(row));
//}
//
//// Edit item function
//function editItem(type, index) {
//    if (type === 'specialization') {
//        const item = specializationData[index];
//        document.getElementById('specializationName').value = item.name;
//        document.getElementById('specializationModalTitle').textContent = 'Edit Department';
//        editingSpecializationIndex = index;
//        openModal('specializationModal');
//    } else if (type === 'contract') {
//        const item = contractData[index];
//        document.getElementById('contractTypeName').value = item.name;
//        document.getElementById('contractModalTitle').textContent = 'Edit Status';
//        editingContractIndex = index;
//        openModal('contractModal');
//    } else if (type === 'folder') {
//        const item = folderData[index];
//        document.getElementById('folderName').value = item.name;
//        document.getElementById('folderModalTitle').textContent = 'Edit Folder';
//        currentSubfolders = [...item.subfolders];
//        editingFolderIndex = index;
//        updateSubfolderDisplay();
//        openModal('folderModal');
//    }
//}
//
//let deletingFolderIndex = null;
//
//// Open delete modal for folder
//function openDeleteModal(type, index) {
//    if (type === 'folder') {
//        deletingFolderIndex = index;
//        const folder = folderData[index];
//        document.getElementById('deleteFolderName').textContent = folder.name;
//
//        const subfoldersList = document.getElementById('deleteSubfoldersList');
//        subfoldersList.innerHTML = '';
//
//        if (folder.subfolders.length > 0) {
//            const header = document.createElement('p');
//            header.innerHTML = '<strong>Sub-folders:</strong>';
//            subfoldersList.appendChild(header);
//
//            folder.subfolders.forEach((subfolder, subIndex) => {
//                const item = document.createElement('div');
//                item.className = 'subfolder-delete-item';
//                item.innerHTML = `
//                            <span>${subfolder}</span>
//                            <button type="button" class="subfolder-delete-btn" onclick="deleteIndividualSubfolder(${subIndex})">Delete</button>
//                        `;
//                subfoldersList.appendChild(item);
//            });
//        } else {
//            const noSubfolders = document.createElement('p');
//            noSubfolders.innerHTML = '<em>No sub-folders in this folder.</em>';
//            subfoldersList.appendChild(noSubfolders);
//        }
//
//        openModal('folderDeleteModal');
//    }
//}
//
//// Delete individual subfolder from delete modal
//function deleteIndividualSubfolder(subfolderIndex) {
//    if (confirm('Are you sure you want to delete this sub-folder?')) {
//        folderData[deletingFolderIndex].subfolders.splice(subfolderIndex, 1);
//        updateFolderTable();
//        // Refresh the delete modal content
//        openDeleteModal('folder', deletingFolderIndex);
//    }
//}
//
//// Delete entire folder
//function deleteEntireFolder() {
//    if (confirm('Are you sure you want to delete the entire folder and all its sub-folders?')) {
//        folderData.splice(deletingFolderIndex, 1);
//        updateFolderTable();
//        closeModal('folderDeleteModal');
//        deletingFolderIndex = null;
//    }
//}
//
//// Delete subfolder function
//function deleteSubfolder(folderIndex, subfolderIndex) {
//    if (confirm('Are you sure you want to delete this sub-folder?')) {
//        folderData[folderIndex].subfolders.splice(subfolderIndex, 1);
//        updateFolderTable();
//    }
//}
//
//// Delete item function
//function deleteItem(type, index) {
//    if (confirm('Are you sure you want to delete this item?')) {
//        if (type === 'specialization') {
//            specializationData.splice(index, 1);
//            updateSpecializationTable();
//        } else if (type === 'contract') {
//            contractData.splice(index, 1);
//            updateContractTable();
//        } else if (type === 'folder') {
//            folderData.splice(index, 1);
//            updateFolderTable();
//        }
//    }
//}
//
//// Subfolder functions
//function addSubfolder() {
//    const input = document.getElementById('subfolderInput');
//    const subfolderName = input.value.trim();
//
//    if (subfolderName && !currentSubfolders.includes(subfolderName)) {
//        currentSubfolders.push(subfolderName);
//        input.value = '';
//        updateSubfolderDisplay();
//    }
//}
//
//function removeSubfolder(index) {
//    currentSubfolders.splice(index, 1);
//    updateSubfolderDisplay();
//}
//
//function updateSubfolderDisplay() {
//    const container = document.getElementById('subfolderList');
//    container.innerHTML = '';
//
//    currentSubfolders.forEach((subfolder, index) => {
//        const tag = document.createElement('span');
//        tag.className = 'subfolder-tag';
//        tag.innerHTML = `${subfolder} <button type="button" class="remove-subfolder-btn" onclick="removeSubfolder(${index})">×</button>`;
//        container.appendChild(tag);
//    });
//}
//
//// Update table functions
//function updateSpecializationTable() {
//    const tbody = document.getElementById('specializationTableBody');
//    tbody.innerHTML = '';
//
//    specializationData.forEach((item, index) => {
//        const row = document.createElement('tr');
//        row.innerHTML = `
//                    <td>${item.name}</td>
//                    <td><span class="count">${item.count > 0 ? '( ' + item.count + ' )' : ''}</span></td>
//                    <td>
//                        <button class="action-btn" onclick="editItem('specialization', ${index})">✏️</button>
//                        <button class="action-btn delete-btn" onclick="deleteItem('specialization', ${index})">🗑️</button>
//                    </td>
//                `;
//        tbody.appendChild(row);
//    });
//
//    document.getElementById('specializationPagination').textContent = `Showing 1 to ${specializationData.length} of ${specializationData.length} entries`;
//}
//
//function updateContractTable() {
//    const tbody = document.getElementById('contractTableBody');
//    tbody.innerHTML = '';
//
//    contractData.forEach((item, index) => {
//        const row = document.createElement('tr');
//        row.innerHTML = `
//                    <td>${item.name}</td>
//                    <td>
//                        <button class="action-btn" onclick="editItem('contract', ${index})">✏️</button>
//                        <button class="action-btn delete-btn" onclick="deleteItem('contract', ${index})">🗑️</button>
//                    </td>
//                `;
//        tbody.appendChild(row);
//    });
//
//    document.getElementById('contractPagination').textContent = `Showing 1 to ${contractData.length} of ${contractData.length} entries`;
//}
//
//function updateFolderTable() {
//    const tbody = document.getElementById('folderTableBody');
//    tbody.innerHTML = '';
//
//    folderData.forEach((item, folderIndex) => {
//        if (item.subfolders.length === 0) {
//            // If no subfolders, show just the folder with empty subfolder cell
//            const row = document.createElement('tr');
//            row.innerHTML = `
//                        <td>${item.name}</td>
//                        <td><em>No sub-folders</em></td>
//                        <td>
//                            <button class="action-btn" onclick="editItem('folder', ${folderIndex})">✏️</button>
//                            <button class="action-btn delete-btn" onclick="openDeleteModal('folder', ${folderIndex})">🗑️</button>
//                        </td>
//                    `;
//            tbody.appendChild(row);
//        } else {
//            // Create rows for each subfolder
//            item.subfolders.forEach((subfolder, subIndex) => {
//                const row = document.createElement('tr');
//                row.innerHTML = `
//                            <td>${subIndex === 0 ? item.name : ''}</td>
//                            <td>${subfolder}</td>
//                            <td>
//                                ${subIndex === 0 ? `<button class="action-btn" onclick="editItem('folder', ${folderIndex})">✏️</button>
//                                <button class="action-btn delete-btn" onclick="openDeleteModal('folder', ${folderIndex})">🗑️</button>` : ''}
//                            </td>
//                        `;
//                tbody.appendChild(row);
//            });
//        }
//    });
//
//    let totalEntries = folderData.reduce((sum, folder) => sum + Math.max(1, folder.subfolders.length), 0);
//    document.getElementById('folderPagination').textContent = `Showing 1 to ${totalEntries} of ${totalEntries} entries`;
//}
//
//// Form submissions
//document.getElementById('specializationForm').addEventListener('submit', function (e) {
//    e.preventDefault();
//    const name = document.getElementById('specializationName').value.trim();
//    if (name) {
//        if (editingSpecializationIndex !== null) {
//            specializationData[editingSpecializationIndex].name = name;
//            editingSpecializationIndex = null;
//        } else {
//            specializationData.push({ name: name, count: 0 });
//        }
//        updateSpecializationTable();
//        closeModal('specializationModal');
//        this.reset();
//    }
//});
//
//document.getElementById('contractForm').addEventListener('submit', function (e) {
//    e.preventDefault();
//    const name = document.getElementById('contractTypeName').value.trim();
//    if (name) {
//        if (editingContractIndex !== null) {
//            contractData[editingContractIndex].name = name;
//            editingContractIndex = null;
//        } else {
//            contractData.push({ name: name });
//        }
//        updateContractTable();
//        closeModal('contractModal');
//        this.reset();
//    }
//});
//
//document.getElementById('folderForm').addEventListener('submit', function (e) {
//    e.preventDefault();
//    const name = document.getElementById('folderName').value.trim();
//    if (name) {
//        if (editingFolderIndex !== null) {
//            folderData[editingFolderIndex].name = name;
//            folderData[editingFolderIndex].subfolders = [...currentSubfolders];
//            editingFolderIndex = null;
//        } else {
//            folderData.push({ name: name, subfolders: [...currentSubfolders] });
//        }
//        updateFolderTable();
//        closeModal('folderModal');
//        this.reset();
//        currentSubfolders = [];
//    }
//});
//
//// Add search event listeners
//document.getElementById('specializationSearch').addEventListener('keyup', function () {
//    filterTable('specializationSearch');
//});
//
//document.getElementById('contractSearch').addEventListener('keyup', function () {
//    filterTable('contractSearch');
//});
//
//document.getElementById('folderSearch').addEventListener('keyup', function () {
//    filterTable('folderSearch');
//});
//
//// Allow adding subfolder with Enter key
//document.getElementById('subfolderInput').addEventListener('keypress', function (e) {
//    if (e.key === 'Enter') {
//        e.preventDefault();
//        addSubfolder();
//    }
//});
//
//// Close modal when clicking outside
//window.addEventListener('click', function (event) {
//    const modals = document.querySelectorAll('.modal');
//    modals.forEach(modal => {
//        if (event.target === modal) {
//            modal.style.display = 'none';
//        }
//    });
//});
//
//// Initial table render
//updateSpecializationTable();
//updateContractTable();
//updateFolderTable();


// Base API URLs
const API_BASE = "http://localhost:8000/dms/api"; // Change port if needed
const DEPARTMENT_API = `${API_BASE}/departments`;
const STATUS_API = `${API_BASE}/statuses`;
const FOLDER_API = `${API_BASE}/folders`;

// Data storage
let specializationData = [];
let contractData = [];
let folderData = [];

let editingSpecializationIndex = null;
let editingContractIndex = null;
let editingFolderIndex = null;
let deletingFolderIndex = null;
let currentSubfolders = [];

// ------------------ MODAL FUNCTIONS ------------------
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    if (modalId === 'folderModal') {
        currentSubfolders = [];
        updateSubfolderDisplay();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    editingSpecializationIndex = null;
    editingContractIndex = null;
    editingFolderIndex = null;
    deletingFolderIndex = null;
    currentSubfolders = [];

    // Reset form titles
    if (modalId === 'specializationModal') {
        document.getElementById('specializationModalTitle').textContent = 'Add Department';
    } else if (modalId === 'contractModal') {
        document.getElementById('contractModalTitle').textContent = 'Add Status';
    } else if (modalId === 'folderModal') {
        document.getElementById('folderModalTitle').textContent = 'Add Folder';
        document.getElementById('folderForm').reset();
        updateSubfolderDisplay();
    }
}

// ------------------ SEARCH & SORT ------------------
function clearSearch(inputId) {
    document.getElementById(inputId).value = '';
    filterTable(inputId);
}

function filterTable(inputId) {
    const input = document.getElementById(inputId);
    const filter = input.value.toUpperCase();
    let tableId;

    if (inputId.includes('specialization')) tableId = 'specializationTableBody';
    else if (inputId.includes('contract')) tableId = 'contractTableBody';
    else if (inputId.includes('folder')) tableId = 'folderTableBody';

    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName('tr');

    for (let row of rows) {
        const cells = row.getElementsByTagName('td');
        let found = false;
        for (let i = 0; i < cells.length - 1; i++) {
            if (cells[i].textContent.toUpperCase().indexOf(filter) > -1) {
                found = true;
                break;
            }
        }
        row.style.display = found ? '' : 'none';
    }
}

function sortTable(columnIndex, tableType) {
    let tableId = tableType === 'specialization' ? 'specializationTableBody'
                  : tableType === 'contract' ? 'contractTableBody'
                  : 'folderTableBody';

    const table = document.getElementById(tableId);
    const rows = Array.from(table.rows);

    rows.sort((a, b) => a.cells[columnIndex].textContent.trim().localeCompare(b.cells[columnIndex].textContent.trim()));
    rows.forEach(row => table.appendChild(row));
}

// ------------------ EDIT FUNCTIONS ------------------
function editItem(type, index) {
    if (type === 'specialization') {
        const item = specializationData[index];
        document.getElementById('specializationName').value = item.name;
        document.getElementById('specializationModalTitle').textContent = 'Edit Department';
        editingSpecializationIndex = index;
        openModal('specializationModal');
    } else if (type === 'contract') {
        const item = contractData[index];
        document.getElementById('contractTypeName').value = item.name;
        document.getElementById('contractModalTitle').textContent = 'Edit Status';
        editingContractIndex = index;
        openModal('contractModal');
    } else if (type === 'folder') {
        const item = folderData[index];
        document.getElementById('folderName').value = item.name;
        document.getElementById('folderModalTitle').textContent = 'Edit Folder';
        currentSubfolders = [...item.subfolders];
        editingFolderIndex = index;
        updateSubfolderDisplay();
        openModal('folderModal');
    }
}

// ------------------ DELETE FUNCTIONS ------------------
function openDeleteModal(type, index) {
    if (type === 'folder') {
        deletingFolderIndex = index;
        const folder = folderData[index];
        document.getElementById('deleteFolderName').textContent = folder.name;

        const subfoldersList = document.getElementById('deleteSubfoldersList');
        subfoldersList.innerHTML = '';
        if (folder.subfolders.length > 0) {
            const header = document.createElement('p');
            header.innerHTML = '<strong>Sub-folders:</strong>';
            subfoldersList.appendChild(header);
            folder.subfolders.forEach((subfolder, subIndex) => {
                const item = document.createElement('div');
                item.className = 'subfolder-delete-item';
                item.innerHTML = `
                    <span>${subfolder}</span>
                    <button type="button" class="subfolder-delete-btn" onclick="deleteIndividualSubfolder(${subIndex})">Delete</button>
                `;
                subfoldersList.appendChild(item);
            });
        } else {
            subfoldersList.innerHTML = '<p><em>No sub-folders in this folder.</em></p>';
        }

        openModal('folderDeleteModal');
    }
}

async function deleteItem(type, index) {
    if (!confirm('Are you sure?')) return;
    try {
        if (type === 'specialization') {
            await fetch(`${DEPARTMENT_API}/${specializationData[index].id}`, { method: 'DELETE' });
            specializationData.splice(index, 1);
            updateSpecializationTable();
        } else if (type === 'contract') {
            await fetch(`${STATUS_API}/${contractData[index].id}`, { method: 'DELETE' });
            contractData.splice(index, 1);
            updateContractTable();
        } else if (type === 'folder') {
            await fetch(`${FOLDER_API}/biswa/${folderData[index].id}`, { method: 'DELETE' });
            folderData.splice(index, 1);
            updateFolderTable();
        }
    } catch (err) { console.error(err); alert('Error deleting item'); }
}

function deleteIndividualSubfolder(subfolderIndex) {
    if (!confirm('Are you sure?')) return;
    currentSubfolders.splice(subfolderIndex, 1);
    updateSubfolderDisplay();
}

// ------------------ SUBFOLDER FUNCTIONS ------------------
function addSubfolder() {
    const input = document.getElementById('subfolderInput');
    const subfolderName = input.value.trim();
    if (subfolderName && !currentSubfolders.includes(subfolderName)) {
        currentSubfolders.push(subfolderName);
        input.value = '';
        updateSubfolderDisplay();
    }
}

function removeSubfolder(index) {
    currentSubfolders.splice(index, 1);
    updateSubfolderDisplay();
}

function updateSubfolderDisplay() {
    const container = document.getElementById('subfolderList');
    container.innerHTML = '';
    currentSubfolders.forEach((subfolder, index) => {
        const tag = document.createElement('span');
        tag.className = 'subfolder-tag';
        tag.innerHTML = `${subfolder} <button type="button" class="remove-subfolder-btn" onclick="removeSubfolder(${index})">×</button>`;
        container.appendChild(tag);
    });
}

// ------------------ UPDATE TABLES ------------------
function updateSpecializationTable() {
    const tbody = document.getElementById('specializationTableBody');
    tbody.innerHTML = '';
    specializationData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td><span class="count">${item.count > 0 ? '( ' + item.count + ' )' : ''}</span></td>
            <td>
                <button class="action-btn" onclick="editItem('specialization', ${index})">✏️</button>
                <button class="action-btn delete-btn" onclick="deleteItem('specialization', ${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    document.getElementById('specializationPagination').textContent = `Showing 1 to ${specializationData.length} of ${specializationData.length} entries`;
}

function updateContractTable() {
    const tbody = document.getElementById('contractTableBody');
    tbody.innerHTML = '';
    contractData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>
                <button class="action-btn" onclick="editItem('contract', ${index})">✏️</button>
                <button class="action-btn delete-btn" onclick="deleteItem('contract', ${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    document.getElementById('contractPagination').textContent = `Showing 1 to ${contractData.length} of ${contractData.length} entries`;
}

function updateFolderTable() {
    const tbody = document.getElementById('folderTableBody');
    tbody.innerHTML = '';
    folderData.forEach((item, folderIndex) => {
        if (item.subfolders.length === 0) {
            tbody.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td><em>No sub-folders</em></td>
                    <td>
                        <button class="action-btn" onclick="editItem('folder', ${folderIndex})">✏️</button>
                        <button class="action-btn delete-btn" onclick="openDeleteModal('folder', ${folderIndex})">🗑️</button>
                    </td>
                </tr>`;
        } else {
            item.subfolders.forEach((subfolder, subIndex) => {
                tbody.innerHTML += `
                    <tr>
                        <td>${subIndex === 0 ? item.name : ''}</td>
                        <td>${subfolder}</td>
                        <td>
                            ${subIndex === 0 ? `<button class="action-btn" onclick="editItem('folder', ${folderIndex})">✏️</button>
                            <button class="action-btn delete-btn" onclick="openDeleteModal('folder', ${folderIndex})">🗑️</button>` : ''}
                        </td>
                    </tr>`;
            });
        }
    });
    let totalEntries = folderData.reduce((sum, folder) => sum + Math.max(1, folder.subfolders.length), 0);
    document.getElementById('folderPagination').textContent = `Showing 1 to ${totalEntries} of ${totalEntries} entries`;
}

// ------------------ FORM SUBMISSIONS ------------------
document.getElementById('specializationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('specializationName').value.trim();
    if (!name) return;

    try {
        if (editingSpecializationIndex !== null) {
            const id = specializationData[editingSpecializationIndex].id;
            const res = await fetch(`${DEPARTMENT_API}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const updated = await res.json();
            specializationData[editingSpecializationIndex] = { name: updated.name, id: updated.id, count: 0 };
            editingSpecializationIndex = null;
        } else {
            const res = await fetch(DEPARTMENT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const newDept = await res.json();
            specializationData.push({ name: newDept.name, id: newDept.id, count: 0 });
        }
        updateSpecializationTable();
        closeModal('specializationModal');
        this.reset();
    } catch (err) { console.error(err); alert('Error saving department'); }
});

document.getElementById('contractForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('contractTypeName').value.trim();
    if (!name) return;

    try {
        if (editingContractIndex !== null) {
            const id = contractData[editingContractIndex].id;
            const res = await fetch(`${STATUS_API}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const updated = await res.json();
            contractData[editingContractIndex] = { name: updated.name, id: updated.id };
            editingContractIndex = null;
        } else {
            const res = await fetch(`${STATUS_API}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const newStatus = await res.json();
            contractData.push({ name: newStatus.name, id: newStatus.id });
        }
        updateContractTable();
        closeModal('contractModal');
        this.reset();
    } catch (err) { console.error(err); alert('Error saving status'); }
});

document.getElementById('folderForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('folderName').value.trim();
    if (!name) return;

    try {
        if (editingFolderIndex !== null) {
            const id = folderData[editingFolderIndex].id;
            const res = await fetch(`${FOLDER_API}/biswa/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, subFolders: currentSubfolders.map(n => ({ name: n })) })
            });
            const updated = await res.json();
            folderData[editingFolderIndex] = { name: updated.name, id: updated.id, subfolders: updated.subFolders.map(sf => sf.name) };
            editingFolderIndex = null;
        } else {
            const res = await fetch(`${FOLDER_API}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, subFolders: currentSubfolders.map(n => ({ name: n })) })
            });
            const newFolder = await res.json();
            folderData.push({ name: newFolder.name, id: newFolder.id, subfolders: newFolder.subFolders.map(sf => sf.name) });
        }
        updateFolderTable();
        closeModal('folderModal');
        this.reset();
        currentSubfolders = [];
    } catch (err) { console.error(err); alert('Error saving folder'); }
});

// ------------------ SEARCH EVENTS ------------------
document.getElementById('specializationSearch').addEventListener('keyup', () => filterTable('specializationSearch'));
document.getElementById('contractSearch').addEventListener('keyup', () => filterTable('contractSearch'));
document.getElementById('folderSearch').addEventListener('keyup', () => filterTable('folderSearch'));

// Add subfolder with Enter key
document.getElementById('subfolderInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); addSubfolder(); }
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => { if (event.target === modal) modal.style.display = 'none'; });
});

// ------------------ INITIAL LOAD ------------------
async function initialize() {
    try {
        const [deptRes, statusRes, folderRes] = await Promise.all([
            fetch(`${DEPARTMENT_API}/get`),
            fetch(`${STATUS_API}/get`),
            fetch(`${FOLDER_API}/get`)
        ]);
        const [depts, statuses, folders] = await Promise.all([deptRes.json(), statusRes.json(), folderRes.json()]);

        specializationData = depts.map(d => ({ name: d.name, id: d.id, count: 0 }));
        contractData = statuses.map(s => ({ name: s.name, id: s.id }));
        folderData = folders.map(f => ({ name: f.name, id: f.id, subfolders: f.subFolders.map(sf => sf.name) }));

        updateSpecializationTable();
        updateContractTable();
        updateFolderTable();
    } catch (err) { console.error(err); alert('Error loading initial data'); }
}

window.addEventListener('DOMContentLoaded', initialize);
