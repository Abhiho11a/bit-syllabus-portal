import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    user_name: {
      type: String,
      default: "Anonymous",
    },
    role: {
      type: String,
      default: "guest",
    },
    action: {
      type: String,
      required: true,
      // e.g., "PAGE_VIEW", "MANUAL_APPROVE", "LOGIN"
    },
    details: {
      type: String,
      required: true,
      // e.g., "/dean/dashboard" or "Approved syllabus.pdf"
    },
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt
  }
);

const Activity = mongoose.model("Activity", ActivitySchema);

export default Activity;
