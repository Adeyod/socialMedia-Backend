import mongoose, { Schema } from 'mongoose';

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now(), expires: 1800 },
});

const Token = mongoose.model('Token', tokenSchema);
export default Token;
