const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const analyzeController = require('../controllers/analyzeController');

// Configure multer for local file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Unified endpoint for both github and local modes
router.post('/analyze', upload.single('file'), analyzeController.analyze);

module.exports = router;
