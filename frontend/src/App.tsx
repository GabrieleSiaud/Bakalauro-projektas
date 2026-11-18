import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Register from "./pages/register";
import Login from "./pages/login.tsx";
import TeacherMain from "./pages/teacherMain.tsx";
import StudentMain from "./pages/studentMain.tsx";
import Profile from "./pages/profile.tsx";

function App() {
    return (
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/student" element={<StudentMain />} />
                <Route path="/teacher" element={<TeacherMain />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
    );
}

export default App;