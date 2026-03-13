const express = require('express');
const router = express.Router();
const {
  registerDrug,
  transferDrug,
  verifyDrug,
  getDrugHistory,
  quarantineDrug,
} = require('../controllers/drugController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', protect, authorize('manufacturer'), registerDrug);
router.post('/transfer', protect, authorize('manufacturer', 'distributor'), transferDrug);
router.get('/verify/:batchId', verifyDrug); // Public route
router.get('/history/:batchId', protect, getDrugHistory);
router.post('/quarantine', protect, authorize('manufacturer', 'regulator'), quarantineDrug);

module.exports = router;
