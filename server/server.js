import express from 'express'; 
import cors from 'cors'; 
import 'dotenv/config';  // Load .env variables
import cookieParser from 'cookie-parser'; 
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js'; 
import userRouter from './routes/userRoutes.js'; 
import { createRequire } from 'module'; // For module resolution if needed

const app = express();
const PORT = process.env.PORT || 4000;

// Allowed origins for CORS to connect frontend with backend
const allowedOrigins = [
  'http://localhost:5173' // Your frontend URL
];

// Connect to MongoDB database
connectDB();

// Middleware
app.use(express.json());           // Parse JSON request bodies
app.use(cookieParser());           // Parse cookies
app.use(cors({
  origin: allowedOrigins, 
  credentials: true                // Allow cookies in cross-origin requests
}));

// API Endpoints
app.get('/', (req, res) => {
  res.send('API working');         // Root API endpoint
});

app.use('/api/auth', authRouter);  // Authentication routes
app.use('/api/user', userRouter);  // User data routes

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on Port ${PORT}`);
});
