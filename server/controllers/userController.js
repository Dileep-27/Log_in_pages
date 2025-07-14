import userModel from '../models/userModel.js'; 

// Get User Data 
export const getUserData = async (req, res) => {
  const { userId } = req.body; // userId is added by userAuth middleware 

  try {
    const user = await userModel.findById(userId); 
    if (!user) {
      return res.json({ success: false, message: 'User not found' }); 
    }

    res.json({
      success: true, 
      userData: {
        name: user.name, 
        isVerified: user.isVerified // Corrected property name from 'isAccountVerified' 
      }
    });

  } catch (error) {
    res.json({ success: false, message: error.message }); 
  }
};