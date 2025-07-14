import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken'; 
import userModel from '../models/userModel.js'; 
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE  } from '../config/emailTemplates.js'; 

// User Registration 
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Check for missing details 
  if (!name || !email || !password) {
    return res.json({ success: false, message: 'Missing details' }); 
  }

  try {
    // Check if user already exists 
    const existingUser = await userModel.findOne({ email }); 
    if (existingUser) {
      return res.json({ success: false, message: 'User already exist' }); 
    }

    // Hash password 
    const hashedPassword = await bcrypt.hash(password, 10); 
    // Create new user 
    const user = new userModel({
      name,
      email,
      password: hashedPassword
    });

    // Save user to database 
    await user.save();

    // Generate JWT token 
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d' 
    });

    // Set cookie 
    res.cookie('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', 
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds 
    });

    // Sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL, 
      to: email, 
      subject: 'Welcome to our app 😊',
      html: EMAIL_VERIFY_TEMPLATE
        .replace('{{email}}', email)
        .replace('{{otp}}', 'N/A') // OTP not relevant for welcome email, but template expects it
    };
    await transporter.sendMail(mailOptions); 

    res.json({ success: true, message: 'Account created and Welcome Email Sent' }); 

  } catch (error) {
    res.json({ success: false, message: error.message }); 
  }
};

// User Login 
export const login = async (req, res) => {
  const { email, password } = req.body; 

  // Check for missing details 
  if (!email || !password) {
    return res.json({ success: false, message: 'Email and password are required' }); 
  }

  try {
    // Find user by email 
    const user = await userModel.findOne({ email }); 
    if (!user) {
      return res.json({ success: false, message: 'Invalid email' }); 
    }

    // Compare passwords 
    const isMatch = await bcrypt.compare(password, user.password); 
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid password' });
    }

    // Generate JWT token 
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d' 
    });

    // Set cookie 
    res.cookie('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.json({ success: true, message: 'Logged in successfully' }); 

  } catch (error) {
    res.json({ success: false, message: error.message }); 
  }
};

// User Logout 
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict' 
    });
    res.json({ success: true, message: 'Logged out' }); 
  } catch (error) {
    res.json({ success: false, message: error.message }); 
  }
};

// Send Email Verification OTP 
export const sendVerifyOTP = async (req, res) => {
  const { userId } = req.body; // userId comes from middleware 

  try {
    const user = await userModel.findById(userId); 
    if (!user) {
      return res.json({ success: false, message: 'User not found' }); // Added for robustness
    }

    if (user.isVerified) { // Corrected property name from 'isAccountVerified' to 'isVerified' to match userModel 
      return res.json({ success: false, message: 'Account already verified' }); 
    }

    // Generate 6-digit OTP 
    const OTP = Math.floor(100000 + Math.random() * 900000).toString(); 

    // Save OTP and expiry to user document 
    user.verifyOTP = OTP; 
    user.verifyOTPExpiredAt = Date.now() + (24 * 60 * 60 * 1000); // 1 day expiry 
    await user.save(); 

    // Send email with OTP 
    const mailOptions = {
      from: process.env.SENDER_EMAIL, 
      to: user.email, 
      subject: 'Account Verification OTP', 
      html: EMAIL_VERIFY_TEMPLATE
        .replace('{{email}}', user.email)
        .replace('{{otp}}', OTP) 
    };
    await transporter.sendMail(mailOptions); 

    res.json({ success: true, message: 'Verification OTP sent on email' }); 

  } catch (error) {
    res.json({ success: false, message: error.message }); 
  }
};

// Verify Email using OTP 
export const verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;  // userId comes from middleware 

  // Check for missing details 
  if (!userId || !OTP) {
    return res.json({ success: false, message: 'Missing details' }); 
  }

  try {
    const user = await userModel.findById(userId); 
    if (!user) {
      return res.json({ success: false, message: 'User not found' }); 
    }

    // Check if OTP matches and is not empty 
    if (user.verifyOTP === '' || user.verifyOTP !== OTP) { // Corrected access to OTP 
      return res.json({ success: false, message: 'Invalid OTP' }); 
    }

    // Check OTP expiry 
    if (user.verifyOTPExpiredAt < Date.now()) { 
      return res.json({ success: false, message: 'OTP expired' }); 
    }

    // Verify account, clear OTP and expiry 
    user.isVerified = true; // Corrected property name 
    user.verifyOTP = ''; 
    user.verifyOTPExpiredAt = 0; 
    await user.save(); 

    res.json({ success: true, message: 'Email verified successfully' }); 

  } catch (error) {
    res.json({ success: false, message: error.message }); 
  }
};

// Check if User is Authenticated 
export const isAuthenticated = async (req, res) => {
  // Authentication check is primarily done by the 'userAuth' middleware 
  // If this controller is reached, it means the middleware has already validated the token.
  try {
    res.json({ success: true }); 
  } catch (error) {
    res.json({ success: false, message: error.message }); 
  }
};

// Send Password Reset OTP 
export const sendResetOTP = async (req, res) => {
  const { email } = req.body; 

  // Check for missing email 
  if (!email) {
    return res.json({ success: false, message: 'Email is required' }); 
  }

  try {
    const user = await userModel.findOne({ email }); 
    if (!user) {
      return res.json({ success: false, message: 'User not found' }); 
    }

    // Generate 6-digit OTP 
    const OTP = Math.floor(100000 + Math.random() * 900000).toString(); 

    // Save OTP and expiry to user document 
    user.resetOTP = OTP; 
    user.resetOTPExpiredAt = Date.now() + (15 * 60 * 1000); // 15 minutes expiry 
    await user.save(); 

    // Send email with OTP 
    const mailOptions = {
      from: process.env.SENDER_EMAIL, 
      to: email, 
      subject: 'Password Reset OTP', 
      html: PASSWORD_RESET_TEMPLATE 
        .replace('{{email}}', email)
        .replace('{{otp}}', OTP) 
    };
    await transporter.sendMail(mailOptions); 

    res.json({ success: true, message: 'OTP sent to your email' }); 

  } catch (error) {
    res.json({ success: false, message: error.message }); 
  }
};

// Reset User Password 
export const resetPassword = async (req, res) => {
  const { email, OTP, newPassword } = req.body; 

  // Check for missing details 
  if (!email || !OTP || !newPassword) {
    return res.json({ success: false, message: 'Email, OTP and new password are required' }); 
  }

  try {
    const user = await userModel.findOne({ email }); 
    if (!user) {
      return res.json({ success: false, message: 'User not found' }); 
    }

    // Check if OTP matches and is not empty 
    if (user.resetOTP === '' || user.resetOTP !== OTP) {
      return res.json({ success: false, message: 'Invalid OTP' }); 
    }

    // Check OTP expiry 
    if (user.resetOTPExpiredAt < Date.now()) {
      return res.json({ success: false, message: 'OTP expired' }); 
    }

    // Hash new password 
    const hashedPassword = await bcrypt.hash(newPassword, 10); 

    // Update password, clear OTP and expiry 
    user.password = hashedPassword; 
    user.resetOTP = ''; 
    user.resetOTPExpiredAt = 0; 
    await user.save(); 

    res.json({ success: true, message: 'Password has been reset successfully' }); 

  } catch (error) {
    res.json({ success: false, message: error.message }); 
  }
};