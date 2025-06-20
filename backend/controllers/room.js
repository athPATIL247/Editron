const { nanoid } = require("nanoid");
const Room = require("../models/room");

const handleCreateRoom = async (req, res) => {
    const { roomName, password, owner } = req.body;
    const roomId = nanoid(7);

    try {
        const newRoom = await Room.create({
            roomId, password, roomName: roomName.trim(), owner, displayContent: "", contributors: [{ username: owner }],
        });
        res.status(201).json({ status: "success", roomDetails: newRoom });
    } catch (err) {
        console.error("Room creation failed: ", err);
        res.status(500).json({ status: "error", error: "Failed to create room" });
    }
}

const handleJoinRoom = async (req, res) => {
    const { roomId, password, username } = req.body;
    try {
        let room = await Room.findOne({ roomId });
        if (!room) return res.status(404).json({ status: "error", error: "Enter a valid Room ID" });
        if (room.password !== password) return res.status(401).json({ status: "error", error: "Invalid Password" });

        const alreadyExists = room.contributors.some(
            (contributor) => contributor.username === username
        );
        if (!alreadyExists) {
            room = await Room.findOneAndUpdate(
                { roomId, password },
                { $push: { contributors: { username } } },
                { new: true }
            );
        }
        res.status(200).json({ status: "success", roomDetails: room });
    } catch (err) {
        console.error("Join Room failed: ", err);
        res.status(500).json({ status: "error", error: "Server error" });
    }
};

const getRoomDetails = async (req, res) => {
    const { roomId } = req.query;
    try {
        const roomDetails = await Room.findOne({ roomId });
        if (!roomDetails) return res.status(404).json({ status: "error", error: "Room not found" });
        return res.json({ roomDetails });
    } catch (error) {
        res.status(500).json({ status: "error", error: "Server error" });
    }
}


module.exports = { handleCreateRoom, handleJoinRoom, getRoomDetails }