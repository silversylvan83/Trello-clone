import mongoose from 'mongoose';
const BoardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  members: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  bg: String
},{timestamps:true});
export default mongoose.model('Board', BoardSchema);
