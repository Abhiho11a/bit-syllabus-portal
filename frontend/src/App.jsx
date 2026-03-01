import { Route , Routes } from "react-router-dom"
import "./App.css"
import Home from "./Home"
import Login from "./pages/Login"
import FacultyDashboard from "./pages/Faculty/Dashboard"
import FacultyPending from "./pages/Faculty/Pending"
import FacultySubmitted from "./pages/Faculty/Submitted"
import BosDashboard from "./pages/Bos/dashboard"
import BosAssign from "./pages/Bos/Assign"
import BosAssignments from "./pages/Bos/Assignments"
import BosFaculty from "./pages/Bos/ManageFaculty"
import CoordinatorDashboard from "./pages/Coordinator/Dashboard"
import CoordinatorSyllabi from "./pages/Coordinator/Syllabi"
import DeanDashboard from "./pages/Dean/Dashboard"
import DeanSyllabi from "./pages/Dean/Syllabi"
import DeanFaculty from "./pages/Dean/ManageFaculty"
import DeanManageBOS from "./pages/Dean/ManageBos"
export default function App(){
  return(
    <div>

      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>

        {/* Faculty user Routes */}
        <Route path="/faculty/dashboard" element={<FacultyDashboard/>}/>
        <Route path="/faculty/pending" element={<FacultyPending/>}/>
        <Route path="/faculty/submitted" element={<FacultySubmitted/>}/>

        {/*  */}
        <Route path="/bos/dashboard" element={<BosDashboard/>}/>
        <Route path="/bos/assign" element={<BosAssign/>}/>
        <Route path="/bos/assignments" element={<BosAssignments/>}/>
        <Route path="/bos/faculty" element={<BosFaculty/>}/>

        {/*  */}
        <Route path="/coordinator/dashboard" element={<CoordinatorDashboard/>}/>
        <Route path="/coordinator/syllabi" element={<CoordinatorSyllabi/>}/>

        {/*  */}
        <Route path="/dean/dashboard" element={<DeanDashboard/>}/>
        <Route path="/dean/syllabi" element={<DeanSyllabi/>}/>
        <Route path="/dean/faculty" element={<DeanFaculty/>}/>
        <Route path="/dean/manage-bos" element={<DeanManageBOS/>}/>
      </Routes>
    
    </div>
  )
}