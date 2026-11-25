
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/App.css";
import "../styles/read.css";

interface Testas {
    id: number;
    dalykas: string;
    pavadinimas: string;
    aprasymas: string;
    vardas: string;
    pavarde: string;
}

interface Klausimas {
    id: number;
    klausimas: string;
    avariantas: string;
    bvariantas: string;
    cvariantas: string;
    dvariantas: string;
    taskai: number;
}

interface Rezultatas {
    surinkti_taskai: number;
    max_taskai: number;
    statusas: string;
}

function TestRead() {
    const [testai, setTestai] = useState<Testas[]>([]);
    const [pasirinktasDalykas, setPasirinktasDalykas] = useState("Visi");
    const [pasirinktasTestas, setPasirinktasTestas] = useState<Testas | null>(null);
    const [klausimai, setKlausimai] = useState<Klausimas[]>([]);
    const [atsakymai, setAtsakymai] = useState<Record<number, string>>({});
    const [rezultatas, setRezultatas] = useState<Rezultatas | null>(null);

    const [kraunama, setKraunama] = useState(true);
    const [klaida, setKlaida] = useState("");
    const [pateikiama, setPateikiama] = useState(false);

    // Gaunami visi mokytojų sukurti testai
    useEffect(() => {
        const gautiTestus = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/tests", {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Nepavyko gauti testų.");
                }

                const data: Testas[] = await response.json();
                setTestai(data || []);
            } catch (error) {
                setKlaida(
                    error instanceof Error ? error.message : "Įvyko klaida."
                );
            } finally {
                setKraunama(false);
            }
        };

        gautiTestus();
    }, []);

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

    const filtruotiTestai = testai.filter((testas) =>
        pasirinktasDalykas === "Visi" ||
        testas.dalykas === pasirinktasDalykas
    );

    // Atidaromas pasirinktas testas
    const atidarytiTesta = async (testas: Testas) => {
        setKlaida("");
        setRezultatas(null);
        setAtsakymai({});
        setKlausimai([]);
        setPasirinktasTestas(testas);

        try {
            const response = await fetch(
                `http://localhost:8080/api/tests/${testas.id}`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Nepavyko gauti testo klausimų.");
            }

            const data = await response.json();
            setKlausimai(data.klausimai || []);
        } catch (error) {
            setKlaida(
                error instanceof Error ? error.message : "Įvyko klaida."
            );
        }
    };

    // Pasirenkamas atsakymas
    const pasirinktiAtsakyma = (klausimoId: number, variantas: string) => {
        setAtsakymai((ankstesni) => ({
            ...ankstesni,
            [klausimoId]: variantas,
        }));
    };

    // Pateikiamas testas
    const pateiktiTesta = async () => {
        if (!pasirinktasTestas) return;

        if (Object.keys(atsakymai).length !== klausimai.length) {
            setKlaida("Atsakykite į visus klausimus prieš pateikdami testą.");
            return;
        }

        setPateikiama(true);
        setKlaida("");

        try {
            const response = await fetch(
                `http://localhost:8080/api/tests/${pasirinktasTestas.id}/submit`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        atsakymai: Object.entries(atsakymai).map(
                            ([klausimoId, variantas]) => ({
                                klausimo_id: Number(klausimoId),
                                variantas,
                            })
                        ),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Nepavyko pateikti testo.");
            }

            const data: Rezultatas = await response.json();
            setRezultatas(data);
        } catch (error) {
            setKlaida(
                error instanceof Error ? error.message : "Įvyko klaida."
            );
        } finally {
            setPateikiama(false);
        }
    };

    const griztiPrieTestu = () => {
        setPasirinktasTestas(null);
        setKlausimai([]);
        setAtsakymai({});
        setRezultatas(null);
        setKlaida("");
    };

    return (
        <>
            <header className="header">
                <Link to="/" className="logo">
                    Šaltinis<span>.</span>
                </Link>
            </header>

            <main className="dashboard">
                <aside className="side-menu">
                    <Link to="/student" className="menu-link">
                        Pagrindinis
                    </Link>

                    <Link to="/theoryRead" className="menu-link">
                        Teorinė medžiaga
                    </Link>

                    <Link
                        to="/testRead"
                        className="menu-link"
                        style={{ fontWeight: "bold", color: "#8E3EE6" }}
                    >
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
                    {!pasirinktasTestas ? (
                        <>
                            <h1>Testai</h1>

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

                            {kraunama ? (
                                <p>Kraunami testai...</p>
                            ) : klaida ? (
                                <p className="theory-error">{klaida}</p>
                            ) : filtruotiTestai.length === 0 ? (
                                <p>Testų nėra.</p>
                            ) : (
                                <div className="theory-list">
                                    {filtruotiTestai.map((testas) => (
                                        <div
                                            className="theory-card"
                                            key={testas.id}
                                        >
                                            <div className="theory-content">
                                                <span>{testas.dalykas}</span>

                                                <h2>{testas.pavadinimas}</h2>

                                                <p>
                                                    {testas.aprasymas ||
                                                        "Testo aprašymas nepateiktas."}
                                                </p>

                                                <p>
                                                    Mokytojas: {testas.vardas}{" "}
                                                    {testas.pavarde}
                                                </p>

                                                <button
                                                    className="theory-filter-button active"
                                                    onClick={() =>
                                                        atidarytiTesta(testas)
                                                    }
                                                >
                                                    Atlikti testą
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                className="theory-back"
                                onClick={griztiPrieTestu}
                            >
                                ← Grįžti prie testų
                            </button>

                            <h1>{pasirinktasTestas.pavadinimas}</h1>
                            <p>{pasirinktasTestas.aprasymas}</p>

                            {klaida && (
                                <p className="theory-error">{klaida}</p>
                            )}

                            {rezultatas ? (
                                <div className="theory-content">
                                    <h2>Testas atliktas!</h2>

                                    <h3>
                                        Surinkote: {rezultatas.surinkti_taskai}{" "}
                                        iš {rezultatas.max_taskai} taškų
                                    </h3>

                                    <p>
                                        Rezultatas:{" "}
                                        {rezultatas.max_taskai > 0
                                            ? Math.round(
                                                rezultatas.surinkti_taskai /
                                                rezultatas.max_taskai * 100
                                            )
                                            : 0}
                                        %
                                    </p>

                                    <p>
                                        Statusas: {rezultatas.statusas}
                                    </p>

                                    <button
                                        className="theory-filter-button active"
                                        onClick={griztiPrieTestu}
                                    >
                                        Grįžti prie testų
                                    </button>
                                </div>
                            ) : klausimai.length === 0 ? (
                                <p>Testas neturi klausimų arba jie kraunami.</p>
                            ) : (
                                <>
                                    {klausimai.map((klausimas, index) => (
                                        <div
                                            className="test-question"
                                            key={klausimas.id}
                                        >
                                            <h3>
                                                {index + 1}. {klausimas.klausimas}
                                            </h3>

                                            <div className="test-answer">
                                                {[
                                                    {
                                                        raide: "A",
                                                        tekstas: klausimas.avariantas,
                                                    },
                                                    {
                                                        raide: "B",
                                                        tekstas: klausimas.bvariantas,
                                                    },
                                                    {
                                                        raide: "C",
                                                        tekstas: klausimas.cvariantas,
                                                    },
                                                    {
                                                        raide: "D",
                                                        tekstas: klausimas.dvariantas,
                                                    },
                                                ].map((variantas) => (
                                                    <label key={variantas.raide}>
                                                        <input
                                                            type="radio"
                                                            name={`klausimas-${klausimas.id}`}
                                                            value={variantas.raide}
                                                            checked={
                                                                atsakymai[klausimas.id] === variantas.raide
                                                            }
                                                            onChange={() =>
                                                                pasirinktiAtsakyma(
                                                                    klausimas.id,
                                                                    variantas.raide
                                                                )
                                                            }
                                                        />

                                                        {variantas.raide}. {variantas.tekstas}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        className="theory-filter-button active"
                                        onClick={pateiktiTesta}
                                        disabled={pateikiama}
                                    >
                                        {pateikiama
                                            ? "Pateikiama..."
                                            : "Pateikti testą"}
                                    </button>
                                </>
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

export default TestRead;
