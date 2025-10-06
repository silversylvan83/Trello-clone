import mongoose from 'mongoose';
const ListSchema = new mongoose.Schema({
  boardId: { type: mongoose.Types.ObjectId, ref: 'Board', index: true, required: true },
  title: { type: String, required: true },
  order: { type: Number, required: true }   // for sorting columns
},{timestamps:true});
export default mongoose.model('List', ListSchema);
