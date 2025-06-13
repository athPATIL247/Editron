const express = require('express');
const { handleCreateRoom, handleJoinRoom, getRoomDetails } = require("../controllers/room");
const { getRoomFiles } = require("../controllers/file");

const router = express.Router();

router.post("/create", handleCreateRoom);
router.post("/join", handleJoinRoom);
router.get("/details", getRoomDetails);
router.get("/files", getRoomFiles);

module.exports = router;