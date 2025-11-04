const File = require("../models/file");

const handleUploadFile = async (req, res) => {
    // const { fileName, associatedRoomId, uploadedBy, fileContent } = req.body;
    try {
        const file = await File.create({
            ...req.body,
            uploadedBy: { id: req.user.id, username: req.user.username }
        });
        return res.status(201).json({ status: "success", message: "File uploaded successfully" });
    } catch (error) {
        return res.status(500).json({ status: "error", error: "File Upload Failure" });
    }
}

const handleGetFile = async (req, res) => {
    // Handle file paths with folders (e.g., "a_todo/index.html" or "a_todo/css/style.css")
    // Since router is mounted at /file, req.path will be relative to that
    // For /file/a_todo/index.html, req.path will be "/a_todo/index.html"
    let fileName = req.path || req.url;
    
    // Remove leading slash
    if (fileName.startsWith('/')) {
        fileName = fileName.substring(1);
    }
    
    // Also handle if URL has query params - remove them
    if (fileName.includes('?')) {
        fileName = fileName.split('?')[0];
    }
    
    // Decode URI components (handles encoded characters like %20 for spaces)
    try {
        fileName = decodeURIComponent(fileName);
    } catch (e) {
        // If decode fails, use as-is
        console.warn('Failed to decode filename:', fileName);
    }
    
    try {
        const file = await File.findOne({ fileName });
        if (!file) {
            return res.status(404).json({ status: "error", error: "File not found" });
        }
        return res.status(200).json({ content: file.fileContent });
    } catch (error) {
        console.error("Error fetching file:", error);
        return res.status(500).json({ status: "error", error: "Could not fetch file" });
    }
}

const getRoomFiles = async (req, res) => {
    const { roomId } = req.query;
    try {
        const files = await File.find(
            { associatedRoomId: roomId },
            { fileName: 1, _id: 0 }  // Only select fileName field, exclude _id
        );
        return res.status(200).json({ status: "success", files });
    } catch (error) {
        return res.status(500).json({ status: "error", error: "Could not fetch files" });
    }
}

const handleContentUpdate = async (req, res) => {
    const { fileName, content } = req.body;
    try {
        const file = await File.findOneAndUpdate({ fileName }, { fileContent: content }, { new: true });
        if (!file) return res.status(404).json({ status: "error", error: "File Not Updated" });
        return res.status(200).json({ status: "success", file });
    } catch (error) {
        return res.status(500).json({ status: "error", error: "Could not update files" });
    }
}

const handleDeleteFile = async (req, res) => {
    console.log('Delete file request received:', req.method, req.path, req.query, req.body);
    
    // Get fileName from query params or body
    const fileName = req.query.fileName || req.body?.fileName;
    
    if (!fileName) {
        console.error('File name missing in request');
        return res.status(400).json({ status: "error", error: "File name is required" });
    }
    
    console.log('Attempting to delete file:', fileName);
    
    try {
        const file = await File.findOneAndDelete({ fileName });
        if (!file) {
            console.error('File not found in database:', fileName);
            return res.status(404).json({ status: "error", error: "File not found" });
        }
        console.log('File deleted successfully:', fileName);
        return res.status(200).json({ status: "success", message: "File deleted successfully" });
    } catch (error) {
        console.error("Error deleting file:", error);
        return res.status(500).json({ status: "error", error: "Could not delete file" });
    }
}

const handleDeleteFolder = async (req, res) => {
    console.log('Delete folder request received:', req.method, req.path, req.query, req.body);
    
    // Get parameters from query params or body
    const folderName = req.query.folderName || req.body?.folderName;
    const roomId = req.query.roomId || req.body?.roomId;
    
    if (!folderName || !roomId) {
        console.error('Missing parameters:', { folderName, roomId });
        return res.status(400).json({ status: "error", error: "Folder name and room ID are required" });
    }
    
    console.log('Attempting to delete folder:', folderName, 'in room:', roomId);
    
    try {
        // Escape special regex characters in folderName
        const escapedFolderName = folderName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Delete all files that start with folderName/
        const result = await File.deleteMany({
            associatedRoomId: roomId,
            fileName: { $regex: `^${escapedFolderName}/` }
        });
        console.log('Folder deleted successfully:', folderName, 'Files removed:', result.deletedCount);
        return res.status(200).json({ 
            status: "success", 
            message: `Folder deleted successfully. Removed ${result.deletedCount} files.` 
        });
    } catch (error) {
        console.error("Error deleting folder:", error);
        return res.status(500).json({ status: "error", error: "Could not delete folder" });
    }
}

module.exports = { handleUploadFile, handleGetFile, getRoomFiles, handleContentUpdate, handleDeleteFile, handleDeleteFolder };