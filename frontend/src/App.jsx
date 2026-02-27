import { Route , Routes } from "react-router-dom"
import "./App.css"
import Home from "./Home"
import Login from "./pages/Login"
export default function App(){
  return(
    <div>

      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
      </Routes>
    
    </div>
  )
}