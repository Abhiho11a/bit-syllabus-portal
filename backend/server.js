import express from "express"
import { connectDb } from "./services/db.js"
import dotenv from "dotenv" 
dotenv.config()
import cors from "cors"
import User from "./models/userModel.js"
import Assignment from "./models/assignmentModel.js"
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


//BOS Requests
//Fetching faculties
app.get("/api/v1/users",async(req,res) => {
  try{
    const {role,department} = req.query

    // console.log(role,department)
    const users = await User.find({role,department})

    res.status(200).json({status:"Success",message:"Users fetched..",users:users})
  }catch (err) {
    console.error("GET/faculties", err);
    return res.status(500).json({ message: "Server error." });
  }
})
//assign tasks
app.post("/api/v1/assignments",async(req,res) => {
  try {
    const {
      faculty_id, subject_code, subject_name,
      sem, department, assigned_by
    } = req.body;

    // validate all fields
    if (!faculty_id || !subject_code || !subject_name || !sem || !department || !assigned_by) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // check faculty exists
    const faculty = await User.findOne({ _id: faculty_id, role: "faculty" });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found." });
    }

    // prevent duplicate assignment for same faculty + subject
    const existing = await Assignment.findOne({
      faculty_id,
      subject_code: subject_code.toUpperCase(),
      status: { $in: ["pending", "submitted"] }   // allow reassign after approve/reject
    });
    if (existing) {
      return res.status(409).json({
        message: `${subject_code} is already assigned to this faculty and is ${existing.status}.`
      });
    }

    const assignment = await Assignment.create({
      assigned_by,
      faculty_id,
      subject_code:  subject_code.toUpperCase(),
      subject_name,
      sem:           Number(sem),
      department:    department.toUpperCase(),
    });

    return res.status(201).json({
      status:  "Success",
      message: "Assignment created. Faculty will see it in pending tasks.",
      assignment,
    });

  } catch (err) {
    console.error("[POST /assignments]", err);
    return res.status(500).json({ message: "Server error." });
  }
})

const PORT = process.env.PORT
app.listen(PORT,"127.0.0.1",()=>{
    console.log(`Listening to the PORT:${PORT}\nhttp://127.0.0.1:${PORT}/`)
})