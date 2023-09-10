import mongoose from "mongoose";

const blogpostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  auther: {
    type: String,
    required: true,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
});
const Blogpost = new mongoose.model("Blogpost", blogpostSchema);
export default Blogpost;
