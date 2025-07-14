import express from 'express'; 

import {
  register,
  login,
  logout,
  sendVerifyOTP,
  verifyEmail,
  isAuthenticated,
  sendResetOTP,
  resetPassword
} from '../controllers/authController.js'; 
import userAuth from '../middleware/user.js';  // Corrected import path

const authRouter = express.Router(); 

// Authentication Routes
authRouter.post('/register', register); 
authRouter.post('/login', login); 
authRouter.post('/logout', logout); 
authRouter.post('/send-verify-otp', userAuth, sendVerifyOTP);  // Requires authentication
authRouter.post('/verify-account', verifyEmail); 
authRouter.get('/is-auth', userAuth, isAuthenticated); // Requires authentication, changed to GET [40]
authRouter.post('/send-reset-otp', sendResetOTP); 
authRouter.post('/reset-password', resetPassword); 

export default authRouter; 