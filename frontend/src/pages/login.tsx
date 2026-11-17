
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/register.css";
import "../styles/App.css";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:8080/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    el_pastas: email,
                    slaptazodis: password,
                }),
            });

            const data = await response.json();

            // Nukreipiame pagal naudotojo rolę
            if (data.role === "mokinys") {
                navigate("/student");
            }
            else if (data.role === "mokytojas") {
                navigate("/teacher");
            }
            else {
                setError("Neatpažinta naudotojo rolė");
            }

        } catch (error) {
            console.error("Prisijungimo klaida:", error);
            setError("Nepavyko prisijungti prie serverio");
        }
    };

    return (
        <>
            <header className="header">
                <Link to="/" className="logo">
                    Šaltinis<span>.</span>
                </Link>

                <div className="header-buttons">
                    <Link to="/" className="login-button">Pagrindinis</Link>
                    <Link to="/register" className="register-button">Registruotis</Link>
                </div>
            </header>

            <main className="register-main">
                <div className="regform">
                    <h1>Sveiki sugrįžę!</h1>
                    <p>Prisijungimas</p>

                    <form onSubmit={handleLogin}>
                        <label>El. paštas</label>
                        <input
                            type="email"
                            placeholder="El. paštas"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label>Slaptažodis</label>
                        <input
                            type="password"
                            placeholder="Slaptažodis"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && <p className="error-message">{error}</p>}

                        <button type="submit">Prisijungti</button>
                    </form>
                </div>
            </main>

            <footer className="footer">
                <Link to="/" className="logo">
                    Šaltinis<span>.</span>
                </Link>
                <p>© 2026 Šaltinis. Mokykis ir siek daugiau.</p>
            </footer>
        </>
    );
}

export default Login;
