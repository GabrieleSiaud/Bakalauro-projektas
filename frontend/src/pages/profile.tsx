import { Link } from "react-router-dom";
import "../styles/App.css";
import "../styles/profile.css";
import "../styles/user.css";
import { useNaudotojas } from "../hooks/useNaudotojas";

function Profile() {
    const { naudotojas, kraunama, klaida } = useNaudotojas();

    if (kraunama) {
        return <p>Įkeliama...</p>;
    }

    if (!naudotojas) {
        return <p>{klaida || "Nepavyko gauti profilio informacijos."}</p>;
    }

    const mokytojas = ["mokytojas", "teacher"].includes(
        naudotojas.role.toLowerCase()
    );

    const vardas = naudotojas.vardas || "";
    const pavarde = naudotojas.pavarde || "";
    const pilnasVardas = vardas + " " + pavarde;

    return (
        <>
            <header className="header">
                <Link to={mokytojas ? "/teacher" : "/student"}className="logo">
                    Šaltinis<span>.</span>
                </Link>
            </header>

            <main className="dashboard">

                {mokytojas ? (
                        <aside className="side-menu">
                            <Link to="/teacher" className="menu-link">
                                Pagrindinis
                            </Link>

                            <Link to="/theoryCreate" className="menu-link" style={{ fontWeight: "bold" }}>
                                Nauja teorinė medžiaga +
                            </Link>

                            <Link to="/teacher/create" className="menu-link"  style={{ fontWeight: "bold" }}>
                                Naujas testas +
                            </Link>

                            <Link to="/profile" className="menu-link" style={{ fontWeight: "bold", color: "#8E3EE6" }}>
                                Profilis
                            </Link>

                            <Link to="/" className="menu-link" style={{ color: "red" }}>
                                Atsijungti
                            </Link>
                        </aside>
                ) : (
                    <aside className="side-menu">
                        <Link to="/student" className="menu-link">
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

                        <Link to="/profile" className="menu-link" style={{ fontWeight: "bold", color: "#8E3EE6" }}>
                            Profilis
                        </Link>

                        <Link to="/" className="menu-link logout">
                            Atsijungti
                        </Link>
                    </aside>
                )}

                <div className="profile-content">

                    <div className="profile-cover"></div>

                    <section className="profile-top">
                        <div className="profile-avatar">
                            {vardas.charAt(0).toUpperCase()}
                        </div>

                        <div className="profile-content-text">
                            <div className="profile-name">
                                <h1>{pilnasVardas}</h1>
                            </div>

                            <div className="profile-qr">
                                {mokytojas ? (
                                    <img src="qr-code.png" alt="QR kodas" className="sideimg"></img>
                                ) : (
                                    <img src="scanner.png" alt="Skanavimas" className="sideimg"></img>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="profile-card">
                        <h2>Apie mane</h2>

                        <p><strong>Vardas:</strong> {vardas}</p>
                        <p><strong>Pavardė:</strong> {pavarde}</p>
                        <p><strong>El. paštas:</strong> {naudotojas.el_pastas}</p>
                    </section>

                    {mokytojas ? (
                        <section className="profile-card">
                            <h2>Mano veikla</h2>

                            <div className="profile-post">
                                <h3>📚 Mokymosi medžiaga</h3>
                                <p>
                                    Čia bus rodomi tavo sukurti
                                    mokymosi konspektai ir užduotys.
                                </p>
                            </div>

                            <div className="profile-post">
                                <h3>📝 Mano sukurti testai</h3>
                                <p>
                                    Čia bus rodomi tavo sukurti
                                    testai mokiniams.
                                </p>
                            </div>
                        </section>
                    ) : (
                        <section className="profile-card">
                            <h2>Mano mokymosi veikla</h2>

                            <div className="profile-post">
                                <h3>📊 Testų rezultatai</h3>
                                <p>
                                    Čia bus rodomi tavo atliktų
                                    testų rezultatai.
                                </p>
                            </div>

                            <div className="profile-post">
                                <h3>🏆 Mano pasiekimai</h3>
                                <p>
                                    Čia bus rodoma tavo mokymosi
                                    pažanga ir pasiekimai.
                                </p>
                            </div>
                        </section>
                    )}

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

export default Profile;