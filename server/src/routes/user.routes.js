const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.get('/', protect, restrictTo('admin'), (req, res) => res.json({ message: 'List all users' }));
router.get('/:id', protect, (req, res) => res.json({ message: `Get user ${req.params.id}` }));
router.put('/:id', protect, (req, res) => res.json({ message: `Update user ${req.params.id}` }));
router.delete('/:id', protect, restrictTo('admin'), (req, res) => res.json({ message: `Delete user ${req.params.id}` }));

module.exports = router;
