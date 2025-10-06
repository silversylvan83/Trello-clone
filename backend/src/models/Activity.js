import mongoose from 'mongoose';
const ActivitySchema = new mongoose.Schema({
  boardId: { type: mongoose.Types.ObjectId, ref: 'Board', index: true },
  type: String, // 'create_card','move_card','rename_list', etc.
  by: { id: String, name: String },
  meta: Object
},{timestamps:true});
export default mongoose.model('Activity', ActivitySchema);
