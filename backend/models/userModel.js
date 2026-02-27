import mongoose from "mongoose";
const UserSchema = new mongoose.Schema(
  {
    // ── Common fields (all roles) ────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,          // optional for most roles
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Minimum 6 characters"],
      select: false,          // never returned in API responses by default
    },

    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["admin", "dean", "bos", "autonomous_coordinator", "faculty"],
    },

    // ── Department (null only for admin) ─────────────────────────
    department: {
      type: String,
      trim: true,
      uppercase: true,        // stored as "CSE", "ECE" etc.
      default: null,
    },

    // ── Faculty only ──────────────────────────────────────────────
    subject_code: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,          // null for all roles except faculty
    },

    subject_name: {
      type: String,
      trim: true,
      default: null,          // null for all roles except faculty
    },

    // ── Account status ────────────────────────────────────────────
    is_active: {
      type: Boolean,
      default: true,
    },

    // ── Who created this user ─────────────────────────────────────
    // faculty  → created by bos
    // bos      → created by dean
    // dean, coordinator → created by admin
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,          // auto adds createdAt + updatedAt
  }
);

// ── Hash password before saving ──────────────────────────────────
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User",UserSchema)

export default {User}