import "../styles/App.css";
import "../styles/user.css";
import {Link} from "react-router-dom";
import {useNaudotojas} from "../hooks/useNaudotojas.tsx";



function TeacherMain() {
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

                <p className="greetings">Sveiki sugrįžę, {naudotojas.vardas}!</p>
            </header>

            <main className="dashboard">
                <aside className="side-menu">
                    <Link to="/teacher" className="menu-link" style={{fontWeight: 'bold', color: '#8E3EE6'}}>
                        Pagrindinis
                    </Link>

                    <Link to="/theoryCreate" className="menu-link" style={{ fontWeight: "bold" }}>
                        Nauja teorinė medžiaga +
                    </Link>

                    <Link to="/teacher/create" className="menu-link"  style={{ fontWeight: "bold" }}>
                        Naujas testas +
                    </Link>

                    <Link to="/teacher/create" className="menu-link">
                        Jūsų istorija
                    </Link>

                    <Link to="/profile" className="menu-link">
                        Profilis
                    </Link>

                    <Link to="/" className="menu-link" style={{ color: "red" }}>
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
                        <h3>0</h3>
                    </div>

                    <div className="stat-card">
                        <p>Sukurtos pamokos</p>
                        <h3>0</h3>
                    </div>

                    <div className="stat-card">
                        <p>Atlikti testai</p>
                        <h3>0</h3>
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
