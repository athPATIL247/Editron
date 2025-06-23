const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomId: {
        type: "String",
        required: true,
        unique: true,
    },
    password: {
        type: "String",
        required: true,
        unique: true,
    },
    roomName: {
        type: "String",
        required: true,
    },
    owner: {
        id: { type: String, required: true },
        username: { type: String, required: true },
    },
    contributors: [{
        id: { type: String, required: true },
        username: { type: String, required: true }
    }],
    messages: [{
        sender: {
            id: { type: String, required: true },
            username: { type: String, required: true }
        },
        time: { type: String, required: true },
        text: { type: "String" }
    }],

}, { timestamps: true });

const Room = mongoose.model('room', roomSchema);
module.exports = Room;