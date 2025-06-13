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
        type: "String",
        required: true,
    },
    contributors: [{ username: { type: String } }],
    messages: [{ sender: { type: String, required: true }, time: { type: String, required: true }, text: { type: "String" } }],

}, { timestamps: true });

const Room = mongoose.model('room', roomSchema);
module.exports = Room;