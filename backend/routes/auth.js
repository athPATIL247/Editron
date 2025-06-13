const express = require('express');
const router = express.Router();
const { handleSignUp, handleLogin } = require("../controllers/auth");

// Sign up
router.post('/signup', handleSignUp);

// Log in
router.post('/login', handleLogin);

module.exports = router;