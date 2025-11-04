const express = require('express');
const { handleUploadFile, handleGetFile, handleContentUpdate, handleDeleteFile, handleDeleteFolder } = require("../controllers/file");
const router = express.Router();

// POST routes
router.post('/upload', handleUploadFile);
router.post('/update', handleContentUpdate);

// DELETE routes - explicit paths, must be before catch-all
router.delete('/delete', (req, res) => {
    console.log('=== DELETE /file/delete route matched ===');
    console.log('Full URL:', req.originalUrl);
    console.log('Query params:', req.query);
    console.log('Body:', req.body);
    handleDeleteFile(req, res);
});

router.delete('/delete-folder', (req, res) => {
    console.log('=== DELETE /file/delete-folder route matched ===');
    console.log('Full URL:', req.originalUrl);
    console.log('Query params:', req.query);
    console.log('Body:', req.body);
    handleDeleteFolder(req, res);
});

// Catch-all route for GET file paths - must be last
// Use regex pattern to match any path (including slashes)
// This only matches GET requests, so DELETE routes above will work
router.get(/.*/, handleGetFile);

module.exports = router;