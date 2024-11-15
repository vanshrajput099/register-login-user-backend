import mongoose from "mongoose";
import 'dotenv/config';

export const connectDatabase = () => {
    return mongoose.connect(process.env.MONGODB_URL);
}
