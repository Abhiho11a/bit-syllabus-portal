import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema({
    // ── Who assigned ─────────────────────────────────────────────
    assigned_by: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,             // BOS user _id
    },

    // ── Who to fill it ───────────────────────────────────────────
    faculty_id: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,             // Faculty user _id
    },

    // ── Subject details ──────────────────────────────────────────
    subject_code: {
      type:     String,
      required: true,
      uppercase: true,
      trim:     true,
    },

    subject_name: {
      type:     String,
      required: true,
      trim:     true,
    },

    sem: {
      type:     Number,
      required: true,
    },

    department: {
      type:     String,
      required: true,
      uppercase: true,
      trim:     true,
    },

    // ── Status ───────────────────────────────────────────────────
    // pending   → faculty hasn't submitted yet
    // submitted → faculty submitted, coordinator reviewing
    // approved  → coordinator approved
    // rejected  → coordinator rejected, faculty must redo
    status: {
      type:    String,
      enum:    ["pending", "submitted", "approved", "rejected"],
      default: "pending",
    },

    // ── PDF (filled after faculty submits via syllabus web) ──────
    pdf_url: {
      type:    String,
      default: null,
    },

    // ── Coordinator's remark (on reject) ─────────────────────────
    remark: {
      type:    String,
      default: "",
    },

    submitted_at: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps: true,   // createdAt = assigned date, updatedAt = last modified
  })

const Assignment = mongoose.model("Assignment",AssignmentSchema)

export default Assignment
