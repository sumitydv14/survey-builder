import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
    if(mongoose.connection.readyState >= 1) {
        return;
    }
    await mongoose.connect(process.env.MONGO_URI as string);
}