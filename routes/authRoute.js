import express from 'express';
import User from '../models/userModel.js';
import {
  loginUser,
  registerUser,
  verifyUser,
} from '../controllers/authController.js';
const router = express.Router();

// REGISTER
router.post('/register', registerUser);

// LOGIN
router.post('/login', loginUser);

// LOGIN
router.post('/user-verification', verifyUser);

export default router;
