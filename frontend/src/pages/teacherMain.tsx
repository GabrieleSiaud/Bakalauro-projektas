
import { useEffect, useState } from "react";
import "../styles/App.css";
import "../styles/user.css";
import { Link } from "react-router-dom";
import { useNaudotojas } from "../hooks/useNaudotojas.tsx";

interface TeacherTheoryItem {
    id: number;
    dalykas: string;
    pavadinimas: string;
}

interface TeacherTestItem {
    id: number;
    dalykas: string;
    pavadinimas: string;
    aprasymas: string;
    klausimu_skaicius: number;
}

interface TeacherContentResponse {
    teorijos: TeacherTheoryItem[];
    testai: TeacherTestItem[];
}

function TeacherMain() {
    const { naudotojas, kraunama } = useNaudotojas();

    const [teorijos, setTeorijos] = useState<TeacherTheoryItem[]>([]);
    const [testai, setTestai] = useState<TeacherTestItem[]>([]);
    const [turinysKraunamas, setTurinysKraunamas] = useState(true);

    useEffect(() => {
        const gautiMokytojoTurini = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/teacherContent", {
                    method: "GET",
                    credentials: "include",
                });
                if (!response.ok) {
                    throw new Error("Nepavyko gauti mokytojo turinio");
                }

                const data: TeacherContentResponse = await response.json();

                setTeorijos(data.teorijos || []);
                setTestai(data.testai || []);

            } catch (error) {
                console.error("Mokytojo turinio klaida:", error);
            } finally {
                setTurinysKraunamas(false);
            }
        };

        if (naudotojas) {
            gautiMokytojoTurini();
        }
    }, [naudotojas]);

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
                    <Link
                        to="/teacher"
                        className="menu-link"
                        style={{ fontWeight: "bold", color: "#8E3EE6" }}
                    >
                        Pagrindinis
                    </Link>

                    <Link
                        to="/theoryCreate"
                        className="menu-link"
                        style={{ fontWeight: "bold" }}
                    >
                        Nauja teorinė medžiaga +
                    </Link>

                    <Link
                        to="/testCreate"
                        className="menu-link"
                        style={{ fontWeight: "bold" }}
                    >
                        Naujas testas +
                    </Link>

                    <Link to="/profile" className="menu-link">
                        Profilis
                    </Link>

                    <Link
                        to="/"
                        className="menu-link"
                        style={{ color: "red" }}
                    >
                        Atsijungti
                    </Link>
                </aside>

                <section className="results">
                    <h2>Rezultatų apžvalga</h2>

                    <p className="results-description">
                        Čia galite stebėti mokinių mokymosi rezultatus
                        ir jų pažangą.
                    </p>

                    <div className="students">
                        <h3>Mokiniai</h3>

                        <p>
                            Čia bus pateikiamas mokinių sąrašas,
                            jų atlikti testai ir pasiekta pažanga.
                        </p>
                    </div>
                </section>

                <section className="containers">

                    <div className="stat-card">
                        <p>Sukurti testai</p>
                        <h3>
                            {turinysKraunamas ? "..." : testai.length}
                        </h3>
                    </div>

                    <div className="stat-card">
                        <p>Sukurta teorinė medžiaga</p>
                        <h3>
                            {turinysKraunamas ? "..." : teorijos.length}
                        </h3>
                    </div>

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

export default TeacherMain;
