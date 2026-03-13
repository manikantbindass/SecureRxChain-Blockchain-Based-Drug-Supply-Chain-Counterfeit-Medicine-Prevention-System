const express = require('express');
const router = express.Router();
const { generateQR } = require('../controllers/qrController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateQR);

module.exports = router;
