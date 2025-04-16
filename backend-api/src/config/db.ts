import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;

  if (!dbUser || !dbPassword) {
    console.error('Database credentials (DB_USER or DB_PASSWORD) are missing.');
    process.exit(1);
  }

  try {
    const uri = `mongodb+srv://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@cluster0.i3iyk4h.mongodb.net/annahna?retryWrites=true&w=majority`;

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
