import jwt from 'jsonwebtoken'; 

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;  // Get token from cookies

    if (!token) {
      return res.json({ success: false, message: 'Not authorized, login again' }); 
    }

    // Verify and decode token 
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET); 

    if (tokenDecode.id) {
      // Add userId to request body for controller access 
      req.userId = tokenDecode.id;
      next(); // Proceed to the next middleware/controller 
    } else {
      return res.json({ success: false, message: 'Not authorized, login again' }); 
    }

  } catch (error) {
    res.json({ success: false, message: error.message }); 
  }
};

export default userAuth; 