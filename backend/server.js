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


//FACULTY requests
app.get("/api/v1/assignments",async(req,res) => {
  try {
    const { faculty_id, status, department } = req.query;

    const query = {};
    if (faculty_id)  query.faculty_id  = faculty_id;
    if (status)      query.status      = status;
    if (department)  query.department  = department.toUpperCase();

    const assignments = await Assignment
      .find(query)
      .populate("assigned_by", "name department")  // get BOS name
      .populate("faculty_id",  "name subject_code") // get faculty name
      .sort({ createdAt: -1 });                     // newest first
      // console.log(assignments)

    return res.status(200).json({
      status: "Success",
      count:  assignments.length,
      assignments,
    });

  } catch (err) {
    console.error("[GET /assignments]", err);
    return res.status(500).json({ message: "Server error." });
  }
})

app.patch("/api/v1/submit",async(req,res)=>{
  try {
    const { assignmentId, pdf_url } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: "assignmentId is required." });
    }

    const assignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      {
        status:       "submitted",
        pdf_url:      pdf_url || null,
        submitted_at: new Date(),
      },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    return res.status(200).json({
      status:  "Success",
      message: "Syllabus submitted successfully.",
      assignment,
    });

  } catch (err) {
    console.error("[PATCH /assignments/submit]", err);
    return res.status(500).json({ message: "Server error." });
  }
})

//COORDINATOR requests
// PATCH /api/v1/assignments/:id/review
app.patch("/api/v1/assignments/:id/review", async (req, res) => {
  try {
    const { status, remark } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'." });
    }

    if (status === "rejected" && !remark?.trim()) {
      return res.status(400).json({ message: "Remark is required when rejecting." });
    }

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }
    if (assignment.status !== "submitted") {
      return res.status(400).json({
        message: `Cannot review — current status is '${assignment.status}'.`
      });
    }

    assignment.status = status;
    assignment.remark = remark?.trim() || "";
    await assignment.save();

    return res.status(200).json({
      status:  "Success",
      message: `Syllabus ${status} successfully.`,
      assignment,
    });

  } catch (err) {
    console.error("[PATCH /assignments/:id/review]", err);
    return res.status(500).json({ message: "Server error." });
  }
});

//DEAN requests
//ADD Bos
app.post("/api/v1/bos",async(req,res) => {
  try{
    const {name,department,password} = req.body;
    const bosExists = await User.findOne({name,department})
    console.log(req.body)

    if(bosExists)
      return res.status(409).json({
          status:"Fail",
          message: `Bos is already assigned.`,
          bosExists
        });

    const newBos = await User.create({
      name,
      department:department.toUpperCase(),
      password,
      role:"bos"
    })
  res.status(200).json({status:"Successs",message:"Bos assigned successfully",newBos})

}catch(err){
  res.status(500).json({status:"Fail",message:err.message})
}
})

const PORT = process.env.PORT
app.listen(PORT,"127.0.0.1",()=>{
    console.log(`Listening to the PORT:${PORT}\nhttp://127.0.0.1:${PORT}/`)
})