
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

function TheoryRead() {
    const { naudotojas, kraunama } = useNaudotojas();

    const [teorijos, setTeorijos] = useState<TheoryItem[]>([]);
    const [pasirinktaTeorija, setPasirinktaTeorija] =
        useState<TheoryItem | null>(null);

    const [turinysKraunamas, setTurinysKraunamas] = useState(true);
    const [klaida, setKlaida] = useState("");
    const [pasirinktasDalykas, setPasirinktasDalykas] =
        useState("Visi");

    // Gaunama teorinė medžiaga
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
                setTeorijos(data || []);
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

    // Dalykai, pagal kuriuos galima filtruoti
    const dalykai = [
        "Visi",
        "Matematika",
        "Informatika",
        "Lietuvių kalba",
        "Anglų kalba",
        "Istorija",
        "Biologija",
        "Fizika",
        "Chemija"
    ];

    // Filtruojama teorinė medžiaga
    const filtruotosTeorijos = teorijos.filter((teorija) =>
        pasirinktasDalykas === "Visi" ||
        teorija.dalykas === pasirinktasDalykas
    );

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

                    <Link to="/testRead" className="menu-link">
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
                    {pasirinktaTeorija ? (
                        // Atidarytos teorijos vaizdas
                        <div className="theory-full">
                            <button
                                className="theory-back"
                                onClick={() => setPasirinktaTeorija(null)}
                            >
                                ← Grįžti prie teorinės medžiagos
                            </button>

                            <h1 className="read-title">
                                {pasirinktaTeorija.pavadinimas}
                            </h1>

                            <p className="theory-author">
                                Mokytojas: {pasirinktaTeorija.vardas}{" "}
                                {pasirinktaTeorija.pavarde}
                            </p>

                            <div className="theory-content">
                                {pasirinktaTeorija.turinys}
                            </div>
                        </div>
                    ) : (
                        // Teorijų sąrašo vaizdas
                        <>
                            <h1 className="read-title">
                                Teorinė medžiaga
                            </h1>

                            {/* Filtravimas – toks pats kaip TestRead */}
                            <div className="theory-filters">
                                <span>Filtruoti pagal dalyką:</span>

                                {dalykai.map((dalykas) => (
                                    <button
                                        key={dalykas}
                                        className={`theory-filter-button ${
                                            pasirinktasDalykas === dalykas
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setPasirinktasDalykas(dalykas)
                                        }
                                    >
                                        {dalykas}
                                    </button>
                                ))}
                            </div>

                            {turinysKraunamas ? (
                                <p>Įkeliama teorinė medžiaga...</p>
                            ) : klaida ? (
                                <p className="theory-error">{klaida}</p>
                            ) : filtruotosTeorijos.length === 0 ? (
                                <p>
                                    {pasirinktasDalykas === "Visi"
                                        ? "Teorinės medžiagos dar nėra."
                                        : "Šiam dalykui teorinės medžiagos dar nėra."}
                                </p>
                            ) : (
                                <div className="theory-list">
                                    {filtruotosTeorijos.map((teorija) => (
                                        <div
                                            className="theory-card"
                                            key={teorija.id}
                                        >
                                            <div className="theory-content">
                                                <span>
                                                    {teorija.dalykas}
                                                </span>

                                                <h2>
                                                    {teorija.pavadinimas}
                                                </h2>

                                                <p>
                                                    Mokytojas: {teorija.vardas}{" "}
                                                    {teorija.pavarde}
                                                </p>

                                                <button
                                                    className="theory-filter-button active"
                                                    onClick={() =>
                                                        setPasirinktaTeorija(teorija)
                                                    }
                                                >
                                                    Skaityti teoriją →
                                                </button>
                                            </div>
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
