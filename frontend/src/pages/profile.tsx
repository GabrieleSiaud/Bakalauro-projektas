import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/App.css";
import "../styles/profile.css";
import "../styles/user.css";
import { useNaudotojas } from "../hooks/useNaudotojas";

interface TeorijaItem {
    id: number;
    dalykas: string;
    pavadinimas: string;
}

interface TestasItem {
    id: number;
    dalykas: string;
    pavadinimas: string;
    aprasymas: string;
    klausimu_skaicius: number;
}

interface MokytojoTurinys {
    teorijos: TeorijaItem[];
    testai: TestasItem[];
}

const listStyle = {
    listStyle: "none",
    margin: "8px 0 0",
    padding: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px"
};

const mutedStyle = {
    color: "#6b6b6b",
    fontSize: "0.9em"
};

function Profile() {
    const { naudotojas, kraunama, klaida } = useNaudotojas();

    // MOKYTOJO SUKURTA TEORIJA IR TESTAI
    const [turinys, setTurinys] = useState<MokytojoTurinys>({
        teorijos: [],
        testai: []
    });
    const [turinysKraunamas, setTurinysKraunamas] = useState(false);
    const [turinioKlaida, setTurinioKlaida] = useState("");

    const role = naudotojas?.role;

    // Hook'ai turi būti prieš bet kokį "return", todėl role tikriname viduje
    useEffect(() => {
        if (!role || !["mokytojas", "teacher"].includes(role.toLowerCase())) {
            return;
        }

        let cancelled = false;

        const loadContent = async () => {
            setTurinysKraunamas(true);
            setTurinioKlaida("");

            try {
                const response = await fetch(
                    "http://localhost:8080/api/teacherContent",
                    {
                        credentials: "include"
                    }
                );

                if (!response.ok) {
                    throw new Error("Nepavyko užkrauti jūsų turinio.");
                }

                const data: MokytojoTurinys = await response.json();

                if (!cancelled) {
                    setTurinys({
                        teorijos: data.teorijos ?? [],
                        testai: data.testai ?? []
                    });
                }
            } catch (err) {
                console.error("Mokytojo turinio užkrovimo klaida:", err);

                if (!cancelled) {
                    setTurinioKlaida(
                        err instanceof Error
                            ? err.message
                            : "Nepavyko užkrauti jūsų turinio."
                    );
                }
            } finally {
                if (!cancelled) {
                    setTurinysKraunamas(false);
                }
            }
        };

        loadContent();

        return () => {
            cancelled = true;
        };
    }, [role]);

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

                        <Link to="/testCreate" className="menu-link"  style={{ fontWeight: "bold" }}>
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

                        <Link to="/theoryRead" className="menu-link" style={{ fontWeight: "bold" }}>
                            Teorinė medžiaga
                        </Link>

                        <Link to="/tests" className="menu-link" style={{ fontWeight: "bold" }}>
                            Testai
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
                                <h3>
                                    Mokymosi medžiaga ({turinys.teorijos.length})
                                </h3>

                                {turinysKraunamas ? (
                                    <p>Įkeliama...</p>
                                ) : turinioKlaida ? (
                                    <p className="theory-error">{turinioKlaida}</p>
                                ) : turinys.teorijos.length === 0 ? (
                                    <p>Dar nesukūrėte teorinės medžiagos.</p>
                                ) : (
                                    <ul style={listStyle}>
                                        {turinys.teorijos.map(t => (
                                            <li key={t.id}>
                                                <strong>{t.pavadinimas}</strong>
                                                <div style={mutedStyle}>
                                                    {t.dalykas}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="profile-post">
                                <h3>
                                    Testai ({turinys.testai.length})
                                </h3>

                                {turinysKraunamas ? (
                                    <p>Įkeliama...</p>
                                ) : turinioKlaida ? (
                                    <p className="theory-error">{turinioKlaida}</p>
                                ) : turinys.testai.length === 0 ? (
                                    <p>Dar nesukūrėte testų.</p>
                                ) : (
                                    <ul style={listStyle}>
                                        {turinys.testai.map(t => (
                                            <li key={t.id}>
                                                <strong>{t.pavadinimas}</strong>
                                                <div style={mutedStyle}>
                                                    {t.dalykas} · klausimų: {t.klausimu_skaicius}
                                                </div>
                                                {t.aprasymas && (
                                                    <div>{t.aprasymas}</div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
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