import { Link } from "react-router-dom";
import "../styles/App.css";
import "../styles/main.css";

function Home() {
    return (
        <>
            <header className="header">
                <Link to="/" className="logo">Šaltinis<span>.</span></Link>

                <div className="header-buttons">
                    <Link to="/login" className="login-button">Prisijungti</Link>
                    <Link to="/register" className="register-button">Registruotis</Link>
                </div>
            </header>

            <main>
                <section className="hero">
                    <div className="hero-content">
                        <h1>
                            Pasiruošk VBE
                            <br />
                            <span>užtikrintai.</span>
                        </h1>

                        <p>
                            Mokykis savo tempu, gilink žinias, spręsk testus
                            ir stebėk savo pažangą vienoje vietoje.
                        </p>

                        <div className="hero-buttons">
                            <Link to="/register" className="primary-button">
                                Pradėti mokytis →
                            </Link>
                            <Link to="#apie" className="secondary-button">
                                Sužinoti daugiau
                            </Link>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <img src="research-paper.png" alt="mokslas" className="hero-photo"></img>
                    </div>
                </section>


                <section className="about-section" id="apie">
                    <div className="section-heading">
                        <h2>
                            Viskas, ko reikia
                            <br />
                            <span>tavo pasiruošimui VBE.</span>
                        </h2>
                        <p>
                            Viena platforma, kurioje gali mokytis, pasitikrinti žinias
                            ir stebėti savo tobulėjimą arba kurti mokymosi turinį kitiems.
                        </p>
                    </div>

                    <div className="about-cards">
                        <div className="about-card-wrapper">
                            <img src="/mokinys.png" alt="Mokinys" className="role-image" />

                            <div className="about-card student-card">
                                <span className="card-label">MOKINIAMS</span>

                                <h3>Mokykis ir siek geresnių rezultatų</h3>
                                <p>
                                    Pasiruošk valstybiniams brandos egzaminams savo tempu.
                                    Visa mokymuisi reikalinga medžiaga vienoje vietoje.
                                </p>

                                <ul>
                                    <li>
                                        <span>📖</span>
                                        <div>
                                            <strong>Mokykis teorijos</strong>
                                            <p>Peržiūrėk mokytojų parengtą mokymosi medžiagą ir gilink žinias.</p>
                                        </div>
                                    </li>
                                    <li>
                                        <span>📝</span>
                                        <div>
                                            <strong>Atlik testus</strong>
                                            <p>Spręsk įvairias užduotis ir pasitikrink, kaip įsisavinai temą.</p>
                                        </div>
                                    </li>
                                    <li>
                                        <span>📊</span>
                                        <div>
                                            <strong>Stebėk savo progresą</strong>
                                            <p>Matyk testų rezultatus, teisingus atsakymus ir mokymosi pažangą.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="about-card-wrapper">
                            <img src="/teacher.png" alt="Mokytojas" className="role-image" />

                            <div className="about-card teacher-card">
                                <span className="card-label">MOKYTOJAMS</span>

                                <h3>Kurk mokymosi turinį ir padėk mokiniams</h3>
                                <p>
                                    Turėk savo mokymo erdvę, kurioje galėsi savarankiškai
                                    paruošti ir pateikti medžiagą mokiniams.
                                </p>

                                <ul>
                                    <li>
                                        <span>📚</span>
                                        <div>
                                            <strong>Kelk teorinę medžiagą</strong>
                                            <p>Kurki pamokas, pateik teoriją ir papildomą mokymosi informaciją.</p>
                                        </div>
                                    </li>
                                    <li>
                                        <span>✏️</span>
                                        <div>
                                            <strong>Kurk testus ir užduotis</strong>
                                            <p>Paruošk klausimus, atsakymų variantus ir žinių patikrinimus.</p>
                                        </div>
                                    </li>
                                    <li>
                                        <span>📈</span>
                                        <div>
                                            <strong>Stebėk mokinių rezultatus</strong>
                                            <p>Peržiūrėk mokinių atliktus testus ir jų mokymosi rezultatus.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </section>



                <section className="bottom-cta">
                    <h2>Pasiruošimas prasideda šiandien, <span>prisijunk!</span></h2>
                    <img src="reading.png" alt="Knyga" className="book-image"></img>
                    <div className="role-options">
                        <Link to="/register" className="role-button">
                            Registruotis
                        </Link>
                    </div>
                </section>


            </main>

            <footer className="footer">
                <a href="/" className="logo">Šaltinis<span>.</span></a>
                <p>© 2026 Šaltinis. Mokykis ir siek daugiau.</p>
            </footer>
        </>
    );
}

export default Home;