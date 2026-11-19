
import { Link } from "react-router-dom";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import "../styles/App.css";
import "../styles/create.css";
import Swal from "sweetalert2";
type InputMode = "write" | "upload";

type ServerResponse = {
    message?: string;
    error?: string;
    pamokos_id?: number;
    teorijos_id?: number;
};

function TheoryCreate() {
    const [dalykas, setDalykas] = useState("");
    const [pavadinimas, setPavadinimas] = useState("");
    const [turinys, setTurinys] = useState("");
    const [mode, setMode] = useState<InputMode>("write");
    const [file, setFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Failo pasirinkimas
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) return;

        const isValidExtension = /\.(pdf|docx|txt)$/i.test(selectedFile.name);

        if (!isValidExtension) {
            setError("Galima įkelti tik PDF, DOCX arba TXT failus.");
            setFile(null);
            e.target.value = "";
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError("Failo dydis negali viršyti 10 MB.");
            setFile(null);
            e.target.value = "";
            return;
        }

        setError("");
        setFile(selectedFile);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");

        if (!dalykas.trim() || !pavadinimas.trim()) {
            setError("Užpildykite visus privalomus laukus.");
            return;
        }

        if (mode === "write" && !turinys.trim()) {
            setError("Įrašykite teorinės medžiagos tekstą.");
            return;
        }

        if (mode === "upload" && !file) {
            setError("Pasirinkite failą, kurį norite įkelti.");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append("dalykas", dalykas);
            formData.append("pavadinimas", pavadinimas);
            formData.append("turinys", turinys);
            formData.append("mode", mode);

            if (mode === "upload" && file) {
                formData.append("file", file);
            }

            const response = await fetch(
                "http://localhost:8080/api/theoryCreate",
                {
                    method: "POST",
                    credentials: "include",
                    body: formData
                }
            );

            const responseText = await response.text();

            console.log("Serverio atsakymas:", responseText);
            console.log("HTTP status:", response.status);

            let data: ServerResponse;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(
                    "Serveris grąžino netinkamą atsakymą: " + responseText
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.message || data.error || "Nepavyko išsaugoti teorijos."
                );
            }

            await Swal.fire({
                title: "Išsaugota!",
                text: "Teorinė medžiaga sėkmingai išsaugota.",
                icon: "success",
                confirmButtonText: "Gerai",
                confirmButtonColor: "#8E3EE6"
            });

            console.log("Sėkmingai išsaugota:", data);

            setDalykas("");
            setPavadinimas("");
            setTurinys("");
            setFile(null);
            setMode("write");

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

        } catch (err) {
            console.error("TEORIJOS IŠSAUGOJIMO KLAIDA:", err);

            const message = err instanceof Error
                ? err.message
                : "Įvyko nenumatyta klaida.";

            await Swal.fire({
                title: "Klaida!",
                text: message,
                icon: "error",
                confirmButtonText: "Supratau",
                confirmButtonColor: "#8E3EE6"
            });

        } finally {
            setLoading(false)
        }
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

                    <Link to="/teacher" className="menu-link">
                        Pagrindinis
                    </Link>

                    <Link to="/theoryCreate" className="menu-link" style={{ fontWeight: "bold", color: "#8E3EE6" }}
                    >
                        Nauja teorinė medžiaga +
                    </Link>

                    <Link to="/teacher/create" className="menu-link" style={{fontWeight: "bold"}}>
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

                <section className="theory-content">

                    <form
                        className="theory-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="theory-field">
                            <h1>Nauja teorinė medžiaga</h1>
                            <label htmlFor="dalykas">
                                Dalykas
                            </label>

                            <select
                                id="dalykas"
                                value={dalykas}
                                onChange={(e) => setDalykas(e.target.value)}
                                required
                            >
                                <option value="">
                                    Pasirinkite dalyką
                                </option>

                                <option value="Matematika">Matematika</option>
                                <option value="Informatika">Informatika</option>
                                <option value="Lietuvių kalba">Lietuvių kalba</option>
                                <option value="Anglų kalba">Anglų kalba</option>
                                <option value="Istorija">Istorija</option>
                                <option value="Biologija">Biologija</option>
                                <option value="Fizika">Fizika</option>
                                <option value="Chemija">Chemija</option>
                                <option value="Kitas">Kitas</option>

                            </select>

                        </div>

                        <div className="theory-field">

                            <label htmlFor="pavadinimas">
                                Tema
                            </label>

                            <input
                                id="pavadinimas"
                                type="text"
                                placeholder="Teorijos tema"
                                value={pavadinimas}
                                onChange={(e) => setPavadinimas(e.target.value)}
                                required
                            />

                        </div>

                        <div className="theory-divider"></div>

                        <h2>Teorinės medžiagos pateikimas</h2>


                        <div className="theory-mode">

                            <button
                                type="button"
                                className={mode === "write" ? "active" : ""}
                                onClick={() => {
                                    setMode("write");
                                    setError("");
                                }}
                            >
                                Rašyti tekstą
                            </button>

                            <button
                                type="button"
                                className={mode === "upload" ? "active" : ""}
                                onClick={() => {
                                    setMode("upload");
                                    setError("");
                                }}
                            >
                                ↑ Įkelti failą
                            </button>

                        </div>

                        {mode === "write" && (

                            <div className="theory-field">
                                <textarea
                                    id="turinys"
                                    placeholder="Pradėkite rašyti teorinę medžiagą..."
                                    value={turinys}
                                    onChange={(e) => setTurinys(e.target.value)}
                                    rows={12}
                                />
                            </div>

                        )}


                        {mode === "upload" && (

                            <div className="theory-upload">

                                <label
                                    htmlFor="file-upload"
                                    className="upload-area"
                                >
                                    <span className="upload-icon">↑</span>

                                    <strong>
                                        {file ? file.name : "Pasirinkite failą"}
                                    </strong>

                                    <span>
                                        {file
                                            ? "Failas pasirinktas"
                                            : "Paspauskite čia ir pasirinkite failą iš savo kompiuterio"}
                                    </span>

                                    <small>PDF, DOCX arba TXT</small>

                                </label>

                                <input
                                    ref={fileInputRef}
                                    id="file-upload"
                                    type="file"
                                    accept=".pdf,.docx,.txt"
                                    onChange={handleFileChange}
                                    hidden
                                />

                                {file && (

                                    <div className="selected-file">

                                        <span>
                                            📄 {file.name}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFile(null);

                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = "";
                                                }
                                            }}
                                        >
                                            Pašalinti
                                        </button>

                                    </div>

                                )}
                            </div>

                        )}

                        {error && (
                            <p className="theory-error">
                                {error}
                            </p>
                        )}

                        <div className="theory-actions">

                            <Link
                                to="/teacher"
                                className="theory-cancel"
                            >
                                Atšaukti
                            </Link>

                            <button
                                type="submit"
                                className="theory-save"
                                disabled={loading}
                            >
                                {loading
                                    ? "Saugoma..."
                                    : "Išsaugoti"}
                            </button>

                        </div>

                    </form>

                </section>

            </main>

            <footer className="footer">

                <Link to="/" className="logo">
                    Šaltinis<span>.</span>
                </Link>

                <p>
                    © 2026 Šaltinis. Mokykis ir siek daugiau.
                </p>

            </footer>
        </>
    );
}

export default TheoryCreate;
