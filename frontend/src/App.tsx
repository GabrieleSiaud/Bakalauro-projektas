import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Register from "./pages/register";
import Login from "./pages/login.tsx";
import StudentMain from "./pages/studentMain.tsx"; 
import TeacherMain from "./pages/teacherMain.tsx";

function App() {
    return (
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/student" element={<StudentMain />} />
                <Route path="/teacher" element={<TeacherMain />} />
            </Routes>
    );
}

export default App;