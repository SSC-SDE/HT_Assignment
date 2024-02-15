// Global variables
let uploadedData;
let headers;
let recordsPerPage = 100;
let currentPage = 1;
let sortOrders = [];

// Function to toggle sorting order
function toggleSortOrder(columnIndex) {
    if (sortOrders[columnIndex] === 'asc') {
        sortOrders[columnIndex] = 'desc';
    } else {
        sortOrders[columnIndex] = 'asc';
    }
}
function sortTable(columnIndex) {
    const table = document.querySelector('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].textContent.trim();
        const cellB = rowB.cells[columnIndex].textContent.trim();

        let comparison = 0;
        if (isNaN(cellA) || isNaN(cellB)) {
            comparison = cellA.localeCompare(cellB);
        } else {
            comparison = parseFloat(cellA) - parseFloat(cellB);
        }

        // Reverse order if sorting order is descending
        return sortOrders[columnIndex] === 'asc' ? comparison : -comparison;
    });

    // Append sorted rows back to table
    rows.forEach(row => tbody.appendChild(row));
}

// Function to handle header click (sorting)
function handleHeaderClick(columnIndex) {
    toggleSortOrder(columnIndex);
    sortTable(columnIndex);
}

function uploadFile() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please choose a file to upload.');
        return;
    }

    // Check if the file type is CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please choose a CSV file.');
        return;
    }

    const formData = new FormData();
    formData.append('csvFile', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(responseData => {
        uploadedData = responseData.data; // Assign 'uploadedData' globally
        headers = responseData.headers; // Assign 'headers' globally
        displayTable(responseData);
    })
    .catch(error => console.error('Error uploading file:', error));
}

function displayTable({ fileName, headers, data, currentPage, totalPages }) {
    const tableContainer = document.getElementById('tableContainer');
    const table = document.createElement('table');

    // Remove existing table contents
    tableContainer.innerHTML = '';

    // Create header row
    const headerRow = table.createTHead().insertRow(); // Move this line inside displayTable function
    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header;
        th.addEventListener('click', () => sortTable(index));
        headerRow.appendChild(th);
    });

    // Populate table body
    const tbody = document.createElement('tbody');
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, data.length);

    for (let i = startIndex; i < endIndex; i++) {
        const rowData = data[i];
        const newRow = tbody.insertRow();
        rowData.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell.trim();
            newRow.appendChild(td);
        });
    }

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    displayPagination(totalPages);
}


function displayPagination(totalPages) {
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => changePage(i));
        paginationContainer.appendChild(button);
    }
}

function changePage(pageNumber) {
    currentPage = pageNumber;
    displayTable({ fileName, headers, data: uploadedData, currentPage, totalPages: Math.ceil(uploadedData.length / recordsPerPage) });
}

document.getElementById('csvFileInput').addEventListener('change', uploadFile);

document.getElementById('searchInput').addEventListener('input', () => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredData = uploadedData.filter(row => {
        const rowData = row.split(',').map(cell => cell.trim().toLowerCase());
        return rowData.some(cell => cell.includes(searchTerm));
    });

    displayTable({ fileName, headers, data: filteredData, currentPage, totalPages: Math.ceil(filteredData.length / recordsPerPage) });
});

function sortTable(columnIndex) {
    const table = document.querySelector('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex];
        const cellB = rowB.cells[columnIndex];

        if (!cellA || !cellB) {
            return 0; // Do nothing if either cell is undefined
        }

        const valueA = cellA.textContent.trim();
        const valueB = cellB.textContent.trim();

        if (isNaN(valueA) || isNaN(valueB)) {
            return valueA.localeCompare(valueB);
        } else {
            return parseFloat(valueA) - parseFloat(valueB);
        }
    });

    // Append sorted rows back to table
    rows.forEach(row => tbody.appendChild(row));
}

// const headerRow = table.createTHead().insertRow();
headers.forEach((header, index) => {
    const th = document.createElement('th');
    th.textContent = header;
    th.addEventListener('click', () => handleHeaderClick(index)); // Attach handleHeaderClick function
    headerRow.appendChild(th);
});
