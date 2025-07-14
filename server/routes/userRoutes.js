import Express from 'express'; 
import userAuth from '../middleware/user.js'; 
import { getUserData } from '../controllers/userController.js'; 

const userRouter = Express.Router(); 

// Define the GET route for user data
userRouter.get('/data', userAuth, getUserData); 

export default userRouter; 