const express = require('express');
const { handleUploadFile, handleGetFile, handleContentUpdate, handleCreateFile } = require("../controllers/file");
const router = express.Router();

router.post('/upload', handleUploadFile);
router.get('/:filename', handleGetFile);
router.post('/update', handleContentUpdate);

module.exports = router;