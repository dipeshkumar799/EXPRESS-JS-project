import mongoose from "mongoose";
const profileSchema = new mongoose.Schema({
  profileImage: {
    type: Buffer,
    required: true,
  },
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
