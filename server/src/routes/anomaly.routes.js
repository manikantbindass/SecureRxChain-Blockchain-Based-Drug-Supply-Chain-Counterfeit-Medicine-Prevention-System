const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.get('/', protect, restrictTo('admin', 'regulator'), (req, res) => res.json({ message: 'List anomalies' }));
router.post('/', protect, (req, res) => res.json({ message: 'Log anomaly' }));
router.put('/:id/resolve', protect, restrictTo('admin', 'regulator'), (req, res) => res.json({ message: `Resolve anomaly ${req.params.id}` }));

module.exports = router;
