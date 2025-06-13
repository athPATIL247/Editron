const File = require("../models/file");

const handleUploadFile = async (req, res) => {
    // const { fileName, associatedRoomId, uploadedBy, fileContent } = req.body;
    try {
        const file = await File.create(req.body);
        return res.status(201).json({ status: "success", message: "File uploaded successfully" });
    } catch (error) {
        return res.status(500).json({ status: "error", error: "File Upload Failure" });
    }
}

const handleGetFile = async (req, res) => {
    const fileName = req.params.filename;
    // const { fileName, associatedRoomId, uploadedBy, fileContent } = req.body;
    try {
        const file = await File.findOne({ fileName });
        return res.status(200).json({ content: file.fileContent });
    } catch (error) {
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
        const file = await await File.findOneAndUpdate({ fileName }, { fileContent: content });;
        if (!file) return res.status(404).json({ status: "error", error: "File Not Updated" });
        return res.status(200).json({ status: "success", file });
    } catch (error) {
        return res.status(500).json({ status: "error", error: "Could not update files" });
    }
}

module.exports = { handleUploadFile, handleGetFile, getRoomFiles, handleContentUpdate };