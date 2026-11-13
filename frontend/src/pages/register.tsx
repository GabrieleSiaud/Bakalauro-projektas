import { useState } from "react";
import "../styles/register.css";
import "../styles/App.css";
import { Link } from "react-router-dom";

function Register() {
    const [role, setRole] = useState<"mokinys" | "mokytojas" | null>(null);
    const [teacherCode, setTeacherCode] = useState("");
    const [codeError, setCodeError] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (role === "mokytojas" && teacherCode.trim().toLowerCase() !== "mokytojas") {
            setCodeError("Neteisingas patvirtinimo kodas!");
            return;
        }

        setCodeError("");
        alert("Patvirtinimas sėkmingas!");
    };

    return (
        <>
            <header className="header">
                <Link to="/" className="logo">Šaltinis<span>.</span></Link>

                <div className="header-buttons">
                    <Link to="/" className="login-button">Pagrindinis</Link>
                    <Link to="/login" className="register-button">Prisijungti</Link>
                </div>
            </header>

            <main className="register-main">
                {!role ? (
                    <div className="role-container">
                        <div
                            className="content"
                            onClick={() => setRole("mokinys")}
                        >
                            <img src="/owl.png" alt="Pelėda" className="photo" />
                            <h2>Registracija <span>mokiniams</span></h2>
                        </div>

                        <div
                            className="content"
                            onClick={() => setRole("mokytojas")}
                        >
                            <img src="/campus.png" alt="Mokykla" className="photo" />
                            <h2>Registracija <span>mokytojams</span></h2>
                        </div>
                    </div>
                ) : (
                    <div className="regform">
                        <button
                            type="button"
                            className="back-button"
                            onClick={() => {
                                setRole(null);
                                setTeacherCode("");
                                setCodeError("");
                            }}
                        >
                            ← Grįžti atgal
                        </button>

                        <h1>Registracija</h1>
                        <p>Registruojatės kaip {role}</p>

                        <form onSubmit={handleSubmit}>
                            <label>Vardas</label>
                            <input type="text" placeholder="Vardas" required />

                            <label>Pavardė</label>
                            <input type="text" placeholder="Pavardė" required />

                            <label>El. paštas</label>
                            <input type="email" placeholder="El. paštas" required />

                            <label>Slaptažodis</label>
                            <input type="password" placeholder="Slaptažodis" required />

                            {role === "mokytojas" && (
                                <>
                                    <label>Patvirtinimo kodas</label>
                                    <input
                                        type="text"
                                        placeholder="Įrašykite patvirtinimo kodą"
                                        value={teacherCode}
                                        onChange={(e) => {
                                            setTeacherCode(e.target.value);
                                            setCodeError("");
                                        }}
                                        required
                                    />

                                    {codeError && (
                                        <p className="error-message">{codeError}</p>
                                    )}
                                </>
                            )}

                            <button type="submit">Registruotis</button>
                        </form>
                    </div>
                )}
            </main>

            <footer className="footer">
                <Link to="/" className="logo">Šaltinis<span>.</span></Link>
                <p>© 2026 Šaltinis. Mokykis ir siek daugiau.</p>
            </footer>
        </>
    );
}

export default Register;
