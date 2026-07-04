const { Router } = require('express');
const {
  register,
  login,
  getProfile,
  logout,
} = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth');

const router = Router();

// Rutas públicas (no requieren token)
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas (requieren token)
router.get('/profile', verifyToken, getProfile);
router.post('/logout', verifyToken, logout); 

module.exports = router;