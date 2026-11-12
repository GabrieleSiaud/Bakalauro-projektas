
import './App.css'

function App() {
    return (
        <>
            <header className="header">
                <a href="/" className="logo">Šaltinis<span>.</span></a>

                <div className="header-buttons">
                    <a href="/login" className="login-button">Prisijungti</a>
                    <a href="/register" className="register-button">Registruotis</a>
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
                            <a href="/register" className="primary-button">
                                Pradėti mokytis →
                            </a>
                            <a href="#apie" className="secondary-button">
                                Sužinoti daugiau
                            </a>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="visual-circle"></div>

                        <div className="study-card">
                            <div className="card-icon">📚</div>
                            <h3>Tavo mokymosi erdvė</h3>
                            <p>Viskas, ko reikia pasiruošti egzaminams.</p>

                            <div className="progress-info">
                                <span>Mokymosi pažanga</span>
                                <strong>75%</strong>
                            </div>

                            <div className="progress-bar">
                                <div></div>
                            </div>

                            <div className="mini-cards">
                                <div>📝 <span>Testai</span></div>
                                <div>🎯 <span>Tikslai</span></div>
                            </div>
                        </div>

                        <div className="floating-card">
                            <span>✨</span>
                            Žingsnis po žingsnio!
                        </div>
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

                        {/* MOKINIAMS */}
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

                                <a href="/register" className="card-link">
                                    Pradėk mokytis →
                                </a>
                            </div>
                        </div>

                        {/* MOKYTOJAMS */}
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
                                            <strong>Kelki teorinę medžiagą</strong>
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

                                <a href="/register" className="card-link">
                                    Tapk mokytoju →
                                </a>
                            </div>
                        </div>

                    </div>
                </section>


                <section className="bottom-cta">
                    <h2>Pasiruošimas prasideda šiandien!</h2>
                    <p>Susikurk paskyrą ir pradėk siekti savo tikslų.</p>
                    <a href="/register" className="primary-button">
                        Prisijunk prie Šaltinio →
                    </a>
                </section>

            </main>

            <footer className="footer">
                <a href="/" className="logo">Šaltinis<span>.</span></a>
                <p>© 2026 Šaltinis. Mokykis ir siek daugiau.</p>
            </footer>
        </>
    )
}

export default App
