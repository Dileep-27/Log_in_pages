import mongoose from 'mongoose'; 

const userSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true 
  },
  email: {
    type: String, 
    required: true, 
    unique: true 
  },
  password: {
    type: String, 
    required: true 
  },
  verifyOTP: {
    type: String, 
    default: '' 
  },
  verifyOTPExpiredAt: {
    type: Number, 
    default: 0 
  },
  isVerified: { // Corrected property name from 'isAccountVerified' 
    type: Boolean, 
    default: false 
  },
  resetOTP: {
    type: String, 
    default: '' 
  },
  resetOTPExpiredAt: {
    type: Number, 
    default: 0 
  }
});

// Check if model already exists to prevent recompilation 
const userModel = mongoose.models.user || mongoose.model('user', userSchema); 

export default userModel; 