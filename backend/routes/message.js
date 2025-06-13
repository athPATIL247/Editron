const express = require('express');
const { handleSendMessage, handleGetMessages } = require("../controllers/message");

const router = express.Router();

router.post("/send", handleSendMessage);
router.get("/", handleGetMessages);

module.exports = router;