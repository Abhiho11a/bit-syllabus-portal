import { Route , Routes } from "react-router-dom"
import "./App.css"
import Home from "./Home"
import Login from "./pages/Login"
import FacultyDashboard from "./pages/Faculty/Dashboard"
import FacultyPending from "./pages/Faculty/Pending"
import FacultySubmitted from "./pages/Faculty/Submitted"
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
      </Routes>
    
    </div>
  )
}