import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}server`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`✅ Database connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);
    process.exit(1); // Exit the app if DB connection fails
  }
};

export default connectDB;
