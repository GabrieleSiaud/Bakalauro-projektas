import { useState } from "react";
import "../styles/register.css";
import "../styles/App.css";
import { Link } from "react-router-dom";

function Register() {
    const [role, setRole] = useState<"mokinys" | "mokytojas" | null>(null);
    const [vardas, setVardas] = useState("");
    const [pavarde, setPavarde] = useState("");
    const [elPastas, setElPastas] = useState("");
    const [slaptazodis, setSlaptazodis] = useState("");
    const [teacherCode, setTeacherCode] = useState("");
    const [codeError, setCodeError] = useState("");


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (role === "mokytojas" && teacherCode.trim() === "") {
            setCodeError("Įveskite patvirtinimo kodą!");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    vardas: vardas,
                    pavarde: pavarde,
                    el_pastas: elPastas,
                    slaptazodis: slaptazodis,
                    role: role,
                    teacherCode: teacherCode
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || data.message || "Registracijos klaida");
                return;
            }

            alert("Registracija sėkminga!");
        } catch (error) {
            console.error("Registracijos klaida:", error);
            alert("Nepavyko susisiekti su serveriu.");
        }
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
                            <input
                                type="text"
                                placeholder="Vardas"
                                value={vardas}
                                onChange={(e) => setVardas(e.target.value)}
                                required
                            />

                            <label>Pavardė</label>
                            <input
                                type="text"
                                placeholder="Pavardė"
                                value={pavarde}
                                onChange={(e) => setPavarde(e.target.value)}
                                required
                            />

                            <label>El. paštas</label>
                            <input
                                type="email"
                                placeholder="El. paštas"
                                value={elPastas}
                                onChange={(e) => setElPastas(e.target.value)}
                                required
                            />

                            <label>Slaptažodis</label>
                            <input
                                type="password"
                                placeholder="Slaptažodis"
                                value={slaptazodis}
                                onChange={(e) => setSlaptazodis(e.target.value)}
                                required
                            />


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
