const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple test route
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

// Test POST route tanpa form-data middleware
app.post('/test-json', (req, res) => {
    console.log('Received JSON data:', req.body);
    res.json({ 
        message: 'JSON data received successfully',
        received: req.body
    });
});

// Test POST route dengan express.urlencoded (form-data alternative)
app.post('/test-form', (req, res) => {
    console.log('Received form data:', req.body);
    res.json({ 
        message: 'Form data received successfully',
        received: req.body
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Test server running on port ${PORT}`);
});