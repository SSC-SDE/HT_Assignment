const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const path = require('path'); // Import the 'path' module

const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let recordsPerPage = 100;
let currentPage = 1;

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle requests to the root path with a GET request
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Send the HTML file
});

// Handle file upload with a POST request to /upload
app.post('/upload', upload.single('csvFile'), (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        // Check if the file type is CSV
        if (!file.originalname.toLowerCase().endsWith('.csv')) {
            return res.status(400).json({ error: 'Invalid file type. Please upload a CSV file.' });
        }

        // Assuming you want to read the CSV data here
        const data = file.buffer.toString().split('\n').map(line => line.split(',').map(cell => cell.trim()));

        const headers = data[0];

        // Assuming you have the CSV data in a variable named 'data'
        const totalRecords = data.length;
        const totalPages = Math.ceil(totalRecords / recordsPerPage);
        const currentPage = req.query.page ? parseInt(req.query.page) : 1;

        if (currentPage < 1 || currentPage > totalPages) {
            return res.status(400).json({ error: 'Invalid page number.' });
        }

        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;

        const paginatedData = data.slice(startIndex, endIndex);

        const responseData = {
            fileName: file.originalname,
            headers: headers,
            data: paginatedData,
            currentPage,
            totalPages,
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error processing CSV file:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
