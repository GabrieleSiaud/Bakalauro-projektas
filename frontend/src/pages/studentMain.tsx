import { useNaudotojas } from "../hooks/useNaudotojas.tsx";
import { Link } from "react-router-dom";
import "../styles/App.css";
import "../styles/user.css";

function StudentMain() {
    const { naudotojas, kraunama } = useNaudotojas();

    if (kraunama || !naudotojas) {
        return <p>Įkeliama profilio informacija...</p>;
    }

    return (
        <>
            <header className="header">
                <Link to="/" className="logo">
                    Šaltinis<span>.</span>
                </Link>

                <p className="greetings">
                    Sveiki sugrįžę, {naudotojas.vardas}!
                </p>
            </header>

            <main className="dashboard">

                <aside className="side-menu">
                    <Link to="/student" className="menu-link" style={{fontWeight: 'bold', color: '#8E3EE6'}}>
                        Pagrindinis
                    </Link>

                    <Link to="/teacher/create" className="menu-link" style={{ fontWeight: "bold" }}>
                        Teorinė medžiaga
                    </Link>

                    <Link to="/tests" className="menu-link" style={{ fontWeight: "bold" }}>
                        Testai
                    </Link>

                    <Link to="/history" className="menu-link">
                        Jūsų istorija
                    </Link>

                    <Link to="/progress" className="menu-link">
                        Pažangos stebėjimas
                    </Link>

                    <Link to="/profile" className="menu-link">
                        Profilis
                    </Link>

                    <Link to="/" className="menu-link logout">
                        Atsijungti
                    </Link>
                </aside>

                <div className="student-content">
                    <section className="student-section">
                        <div className="student-row">
                            <div className="student-card">
                                <h2>Tęsti mokymąsi</h2>
                                <h3>Teorinė medžiaga</h3>
                                <p>Tęskite mokymąsi ir peržiūrėkite mokomąją medžiagą.</p>
                                <Link to="/theory">Peržiūrėti medžiagą →</Link>
                            </div>
                        </div>
                    </section>

                    <section className="student-section">
                        <div className="student-row">
                            <div className="student-card">
                                <h2>Rekomenduojami testai</h2>
                                <h3>Žinių patikrinimas</h3>
                                <p>Atlikite testą ir įvertinkite savo turimas žinias.</p>
                                <Link to="/tests">Pradėti testą →</Link>
                            </div>
                        </div>
                    </section>

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

export default StudentMain;