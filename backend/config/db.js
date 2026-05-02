const mongoose = require('mongoose')

const connectDB = async () => {
 
 try {
    console.log('URI:', process.env.MONGO_URI); // Add this line
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected ✅');
  } catch (err) {
    console.error('MongoDB connection failed ❌', err)
    process.exit(1)
  }
}

module.exports = connectDB