import { Route , Routes } from "react-router-dom"
import { Toaster } from "react-hot-toast"
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
import AdminDashboard from "./pages/Admin/Dashboard"
import AdminUsers from "./pages/Admin/Users"
import AdminDepartments from "./pages/Admin/Departments"
import AdminSyllabi from "./pages/Admin/Syllabi"
import MergeFilesModal from "./components/MergeFilesModal"
import DeanManualApprove from "./pages/Dean/ManualApprove"
import CoordinatorManualApprove from "./pages/Coordinator/ManualApprove"
import CoordinatorAssign from "./pages/Coordinator/Assign"
import CoordinatorSettings from "./pages/Coordinator/Settings"
import Stats from "./pages/Admin/Stats"
import useActivityLogger from "./hooks/useActivityLogger"

export default function App(){
  useActivityLogger();
  return(
    <div>
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'text-sm font-bold shadow-lg border border-slate-100 rounded-2xl',
          style: { fontFamily: "'Figtree', 'Segoe UI', sans-serif" }
        }} 
      />

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
        <Route path="/coordinator/manual-approve" element={<CoordinatorManualApprove/>}/>
        <Route path="/coordinator/settings" element={<CoordinatorSettings/>}/>
        <Route path="/coordinator/assign" element={<CoordinatorAssign/>}/>

        {/*  */}
        <Route path="/dean/dashboard" element={<DeanDashboard/>}/>
        <Route path="/dean/syllabi" element={<DeanSyllabi/>}/>
        <Route path="/dean/manual-approve" element={<DeanManualApprove/>}/>
        <Route path="/dean/faculty" element={<DeanFaculty/>}/>
        <Route path="/dean/manage-bos" element={<DeanManageBOS/>}/>

        {/*  */}
        <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
        <Route path="/admin/users" element={<AdminUsers/>}/>
        <Route path="/admin/departments" element={<AdminDepartments/>}/>
        <Route path="/admin/syllabi" element={<AdminSyllabi/>}/>
        <Route path="/stats" element={<Stats/>}/>


        <Route path="/mergefiles" element={<MergeFilesModal/>}/>
      </Routes>
    
    </div>
  )
}