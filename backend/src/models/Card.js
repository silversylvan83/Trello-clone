import mongoose from 'mongoose';
const CardSchema = new mongoose.Schema({
  boardId: { type: mongoose.Types.ObjectId, ref: 'Board', index: true, required: true },
  listId:  { type: mongoose.Types.ObjectId, ref: 'List',  index: true, required: true },
  title:   { type: String, required: true },
  desc:    String,
  labels:  [{ color: String, name: String }],
  members: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  order:   { type: Number, required: true } // for card sorting within list
},{timestamps:true});
export default mongoose.model('Card', CardSchema);
