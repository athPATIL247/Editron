const express = require('express');
const multer = require("multer");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post('/', upload.single('profileImgage'), (req, res) => {
    console.log(req.body);
    console.log(req.file);

});

module.exports = router;