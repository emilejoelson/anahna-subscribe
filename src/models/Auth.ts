import mongoose from "mongoose";

const AuthSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accessToken: { type: String, required: true, unique: true },
  refreshToken: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Auth", AuthSchema);
