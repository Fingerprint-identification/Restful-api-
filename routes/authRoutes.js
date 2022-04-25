const express = require('express');

const {
  login,
  forgotPassword,
  protect,
  verifyPassResetCode,
  resetPassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyPassResetCode);
router.put('/resetPassword', protect, resetPassword);

module.exports = router;
