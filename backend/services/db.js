import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const connection_str = process.env.DB_URI.replace("password",process.env.DB_PASSWORD)
const connectDb = async () => {
  await mongoose.connect(connection_str);
  console.log("Connected to database...");
};

export {connectDb}