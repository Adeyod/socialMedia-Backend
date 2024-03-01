import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DBConfig = mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log(
      `Connected successfully to MongoDB on ${mongoose.connection.host}`
    );
  })
  .catch((err) => {
    console.log(err);
  });

export default DBConfig;
