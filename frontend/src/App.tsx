import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Register from "./pages/register";
import Login from "./pages/login.tsx";
import TeacherMain from "./pages/teacherMain.tsx";
import StudentMain from "./pages/studentMain.tsx";
import Profile from "./pages/profile.tsx";
import TheoryCreate from "./pages/theoryCreate.tsx";

function App() {
    return (
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/student" element={<StudentMain />} />
                <Route path="/teacher" element={<TeacherMain />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/testCreate" element={<TheoryCreate />} />
                <Route path="/theoryCreate" element={<TheoryCreate />} />
            </Routes>
    );
}

export default App;