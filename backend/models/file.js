const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    associatedRoomId: {
        type: String,
        required: true,
    },
    uploadedBy: {
        id: { type: String, required: true },
        username: { type: String, required: true },
    },
    fileContent: {
        type: String
    }
});

const File = mongoose.model('file', fileSchema);
module.exports = File;