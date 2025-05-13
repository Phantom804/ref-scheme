import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-marketplace';

// Define type for the global cache
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Add type declaration for global mongoose
declare global {
    var mongoose: MongooseCache | undefined;
}

// Global is used here to maintain a cached connection across hot reloads in development
let cached = global.mongoose || { conn: null, promise: null };

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((mongoose) => {
                return mongoose;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

// Call connectToDatabase immediately to establish the connection
connectToDatabase().catch(console.error);

export { mongoose }; 