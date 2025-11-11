const express = require('express');
const { register, login, getMe, updateProfileImage } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/profile-image', auth, updateProfileImage);

module.exports = router;