const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { registerUser, authUser,updateUser, getUserById } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/update', protect, updateUser);
router.get('/:id', protect, getUserById);
module.exports = router;
