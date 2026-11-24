import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Register from "./pages/register";
import Login from "./pages/login.tsx";
import TeacherMain from "./pages/teacherMain.tsx";
import StudentMain from "./pages/studentMain.tsx";
import Profile from "./pages/profile.tsx";
import TheoryCreate from "./pages/theoryCreate.tsx";
import TestCreate from "./pages/testCreate.tsx";
import TheoryRead from "./pages/theoryRead.tsx";

function App() {
    return (
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/student" element={<StudentMain />} />
                <Route path="/teacher" element={<TeacherMain />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/testCreate" element={<TestCreate />} />
                <Route path="/theoryCreate" element={<TheoryCreate />} />
                <Route path="/theoryRead" element={<TheoryRead  />} />
            </Routes>
    );
}

export default App;