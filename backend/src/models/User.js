import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true, index: true },
  passwordHash: String,
  avatar: String
},{timestamps:true});
export default mongoose.model('User', UserSchema);
