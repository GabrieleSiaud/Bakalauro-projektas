
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNaudotojas } from "../hooks/useNaudotojas.tsx";
import "../styles/App.css";
import "../styles/read.css";

interface TheoryItem {
    id: number;
    dalykas: string;
    pavadinimas: string;
    turinys: string;
    vardas: string;
    pavarde: string;
}

const dalykai = [
    "Visi dalykai",
    "Matematika",
    "Informatika",
    "Lietuvių kalba",
    "Anglų kalba",
    "Istorija",
    "Biologija",
    "Fizika",
    "Chemija"
];

function TheoryRead() {
    const { naudotojas, kraunama } = useNaudotojas();

    const [teorijos, setTeorijos] = useState<TheoryItem[]>([]);
    const [pasirinktaTeorija, setPasirinktaTeorija] =
        useState<TheoryItem | null>(null);

    const [turinysKraunamas, setTurinysKraunamas] = useState(true);
    const [klaida, setKlaida] = useState("");
    const [pasirinktasDalykas, setPasirinktasDalykas] =
        useState("Visi dalykai");

    const [rodytiFiltrus, setRodytiFiltrus] = useState(false);
    useEffect(() => {
        const gautiTeorija = async () => {
            try {
                const response = await fetch("/api/theories", {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`Serverio klaida: ${response.status}`);
                }

                const data: TheoryItem[] = await response.json();
                setTeorijos(data);
            } catch (error) {
                console.error("TEORIJOS GAVIMO KLAIDA:", error);
                setKlaida(
                    error instanceof Error
                        ? error.message
                        : "Nepavyko užkrauti teorinės medžiagos."
                );
            } finally {
                setTurinysKraunamas(false);
            }
        };

        if (naudotojas) {
            gautiTeorija();
        }
    }, [naudotojas]);

    const filtruotosTeorijos = teorijos.filter((teorija) => {
        return (
            pasirinktasDalykas === "Visi dalykai" ||
            teorija.dalykas === pasirinktasDalykas
        );
    });

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
                    <Link to="/student" className="menu-link">
                        Pagrindinis
                    </Link>

                    <Link
                        to="/theoryRead"
                        className="menu-link"
                        style={{ fontWeight: "bold", color: "#8E3EE6" }}
                    >
                        Teorinė medžiaga
                    </Link>

                    <Link to="/tests" className="menu-link">
                        Testai
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

                <section className="theory-container">
                    <h2>Teorinė medžiaga</h2>

                    {pasirinktaTeorija ? (
                        <div className="theory-full">
                            <button
                                className="theory-back"
                                onClick={() => setPasirinktaTeorija(null)}
                            >
                                ← Grįžti į teorijos sąrašą
                            </button>

                            <p className="theory-subject">
                                {pasirinktaTeorija.dalykas}
                            </p>

                            <h1>{pasirinktaTeorija.pavadinimas}</h1>

                            <p className="theory-author">
                                Mokytojas: {pasirinktaTeorija.vardas}{" "}
                                {pasirinktaTeorija.pavarde}
                            </p>

                            <div className="theory-content">
                                {pasirinktaTeorija.turinys}
                            </div>
                        </div>
                    ) : (
                        <>

                            <div className="theory-filter-wrapper">
                                <button
                                    className="theory-filter-toggle"
                                    onClick={() => setRodytiFiltrus(!rodytiFiltrus)}
                                >
                                    Filtruoti
                                    <span>
                                        {rodytiFiltrus ? "▲" : "▼"}
                                    </span>
                                </button>

                                {pasirinktasDalykas !== "Visi dalykai" && (
                                    <span className="selected-filter">
                                {pasirinktasDalykas}
                                        <button
                                            onClick={() => setPasirinktasDalykas("Visi dalykai")}
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}

                                {rodytiFiltrus && (
                                    <div className="theory-filters">
                                        {dalykai.map((dalykas) => (
                                            <button
                                                key={dalykas}
                                                className={`theory-filter-button ${
                                                    pasirinktasDalykas === dalykas ? "active" : ""
                                                }`}
                                                onClick={() => {
                                                    setPasirinktasDalykas(dalykas);
                                                    setRodytiFiltrus(false);
                                                }}
                                            >
                                                {dalykas}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>


                            {turinysKraunamas ? (
                                <p>Įkeliama teorinė medžiaga...</p>
                            ) : klaida ? (
                                <p>{klaida}</p>
                            ) : filtruotosTeorijos.length === 0 ? (
                                <p>
                                    Šiam dalykui teorinės medžiagos dar nėra.
                                </p>
                            ) : (
                                <div className="theory-list">
                                    {filtruotosTeorijos.map((teorija) => (
                                        <div
                                            className="theory-card"
                                            key={teorija.id}
                                        >
                                            <p className="theory-subject">
                                                {teorija.dalykas}
                                            </p>

                                            <h3>{teorija.pavadinimas}</h3>

                                            <p className="theory-author">
                                                Mokytojas: {teorija.vardas}{" "}
                                                {teorija.pavarde}
                                            </p>

                                            <button
                                                className="theory-read-button"
                                                onClick={() =>
                                                    setPasirinktaTeorija(teorija)
                                                }
                                            >
                                                Skaityti teoriją →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </section>
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

export default TheoryRead;
