import express from "express"
import { connectDb } from "./services/db.js"
import dotenv from "dotenv" 
dotenv.config()
import cors from "cors"
import User from "./models/userModel.js"
import bcrypt from "bcryptjs"

const app = express();
app.use(express.json());
app.use(cors())
connectDb()

app.get("/",(req,res)=>{
    res.send("Hello from backend")
})
app.post("/api/v1/auth/login", async (req, res) => {
  try {
    const { name, email, department, subject_code, password, role } = req.body;

    // build query based on role
    const query = { role, is_active: true };

    if (role === "faculty") {
      query.name         = name;
      query.department   = department?.toUpperCase();
      query.subject_code = subject_code?.toUpperCase();
    } else if (role === "bos" || role === "autonomous_coordinator") {
      query.name       = name;
      query.department = department?.toUpperCase();
    } else if (role === "dean") {
      query.name = name;
    } else if (role === "admin") {
      query.email = email?.toLowerCase();
    }

    // find user
    const user = await User.findOne(query).select("+password");

    if (!user) {
      return res.status(401).json({ message: "User not found. Contact your administrator." });
    }

    const correctPassword = await bcrypt.compare(password,user.password)
    // check password (plain text for now — swap with comparePassword() after hashing)
    if (!correctPassword) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    return res.status(200).json({
      status: "Success",
      message: "Logged in successfully",
      user: {
        id:           user._id,
        name:         user.name,
        role:         user.role,
        department:   user.department,
        subject_code: user.subject_code,
        subject_name: user.subject_name,
      }
    });

  } catch (err) {
    console.error("[login error]", err);
    return res.status(500).json({ message: "Server error." });
  }
});

const PORT = process.env.PORT
app.listen(PORT,"127.0.0.1",()=>{
    console.log(`Listening to the PORT:${PORT}\nhttp://127.0.0.1:8000/`)
})