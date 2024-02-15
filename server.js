// Import necessary modules
const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const path = require('path');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define global variables
const recordsPerPage = 100;

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle root path GET request
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle file upload POST request to /upload
app.post('/upload', upload.single('csvFile'), handleFileUpload);

// Function to handle file upload
function handleFileUpload(req, res) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      return res.status(400).json({ error: 'Invalid file type. Please upload a CSV file.' });
    }

    const data = parseCsvData(file.buffer.toString());

    const totalPages = Math.ceil(data.length / recordsPerPage);
    const currentPage = parseInt(req.query.page) || 1;

    if (currentPage < 1 || currentPage > totalPages) {
      return res.status(400).json({ error: 'Invalid page number.' });
    }

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, data.length);

    const paginatedData = data.slice(startIndex, endIndex);

    const responseData = {
      fileName: file.originalname,
      headers: data[0],
      data: paginatedData,
      currentPage,
      totalPages,
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error processing CSV file:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

// Function to parse CSV data
function parseCsvData(csvString) {
  return csvString.split('\n').map(line => line.split(',').map(cell => cell.trim()));
}

// Export the express app as a serverless function
module.exports = app;