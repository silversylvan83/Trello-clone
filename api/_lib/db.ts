import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri)
      throw Object.assign(new Error("Missing MONGODB_URI"), {
        statusCode: 500,
      });

    cached.promise = mongoose.connect(uri, { dbName: "trello" });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
