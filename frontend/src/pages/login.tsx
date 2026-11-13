import { useState } from "react";
import "../styles/register.css";
import "../styles/App.css";
import { Link } from "react-router-dom";

function Login() {
    return (
        <>
            <header className="header">
                <Link to="/" className="logo">Šaltinis<span>.</span></Link>

                <div className="header-buttons">
                    <Link to="/" className="login-button">Pagrindinis</Link>
                    <Link to="/register" className="register-button">Registruotis</Link>
                </div>
            </header>

            <main className="register-main">
                <div className="regform">
                    <h1>Sveiki sugrįžę!</h1>
                    <p>Prisijungimas</p>
                    <form>
                        <label>El. paštas</label>
                        <input type="email" placeholder="El. paštas" required />

                        <label>Slaptažodis</label>
                        <input type="password" placeholder="Slaptažodis" required />

                        <button type="submit">Prisijungti</button>
                    </form>
                </div>
            </main>

            <footer className="footer">
                <Link to="/" className="logo">Šaltinis<span>.</span></Link>
                <p>© 2026 Šaltinis. Mokykis ir siek daugiau.</p>
            </footer>
        </>
    )
}

export default Login;