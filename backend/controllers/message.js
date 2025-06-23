const Room = require("../models/room");

const handleSendMessage = async (req, res) => {
    const { time, text, roomId } = req.body;
    const sender = req.user.id;
    try {
        const msg = await Room.findOneAndUpdate(
            { roomId },
            { $push: { messages: { sender, time, text } } },
            { new: true }
        );
        return res.status(201).json({ status: "success", "msg": msg });
    } catch (error) {
        return res.status(500).json({ status: "error", error });
    }
}

const handleGetMessages = async (req, res) => {
    const { roomId } = req.query;
    try {
        const messages = await Room.find(
            { roomId },
            { messages: 1, _id: 0 }
        );
        return res.status(201).json({ status: "success", messages });
    } catch (error) {
        return res.status(500).json({ status: "error", error });
    }
}

module.exports = { handleSendMessage, handleGetMessages }