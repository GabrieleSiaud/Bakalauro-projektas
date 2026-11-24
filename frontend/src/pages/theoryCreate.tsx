import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import "../styles/App.css";
import "../styles/create.css";
import Swal from "sweetalert2";

interface Question {
    id: number;
    text: string;
    answers: string[];
    correctAnswer: number;
    taskai: number;
}

const dalykai = [
    "Matematika",
    "Informatika",
    "Lietuvių kalba",
    "Anglų kalba",
    "Istorija",
    "Biologija",
    "Fizika",
    "Chemija"
];

const createEmptyQuestion = (): Question => ({
    id: Date.now() + Math.random(),
    text: "",
    answers: ["", "", "", ""],
    correctAnswer: 0,
    taskai: 1
});

function TestCreate() {
    // PAMOKA (kaip teorijos kūrime: dalykas + tema)
    const [dalykas, setDalykas] = useState("");
    const [pamokosPavadinimas, setPamokosPavadinimas] = useState("");

    // TESTAS
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [questions, setQuestions] = useState<Question[]>([
        createEmptyQuestion()
    ]);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // PRIDĖTI KLAUSIMĄ
    const addQuestion = () => {
        setQuestions(prev => [
            ...prev,
            createEmptyQuestion()
        ]);
    };

    // PAŠALINTI KLAUSIMĄ
    const removeQuestion = (id: number) => {
        setQuestions(prev =>
            prev.filter(q => q.id !== id)
        );
    };

    // KEISTI KLAUSIMO TEKSTĄ
    const updateQuestion = (id: number, text: string) => {
        setQuestions(prev =>
            prev.map(q =>
                q.id === id ? { ...q, text } : q
            )
        );
    };

    // KEISTI ATSAKYMĄ
    const updateAnswer = (
        questionId: number,
        answerIndex: number,
        value: string
    ) => {
        setQuestions(prev =>
            prev.map(q =>
                q.id === questionId
                    ? {
                        ...q,
                        answers: q.answers.map((a, i) =>
                            i === answerIndex ? value : a
                        )
                    }
                    : q
            )
        );
    };

    // PASIRINKTI TEISINGĄ ATSAKYMĄ
    const setCorrectAnswer = (
        questionId: number,
        answerIndex: number
    ) => {
        setQuestions(prev =>
            prev.map(q =>
                q.id === questionId
                    ? { ...q, correctAnswer: answerIndex }
                    : q
            )
        );
    };

    // KEISTI KLAUSIMO TAŠKUS
    const updatePoints = (id: number, taskai: number) => {
        setQuestions(prev =>
            prev.map(q =>
                q.id === id ? { ...q, taskai } : q
            )
        );
    };

    // IŠSAUGOTI TESTĄ
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!dalykas) {
            setError("Pasirinkite dalyką.");
            return;
        }

        if (!pamokosPavadinimas.trim()) {
            setError("Įveskite pamokos temą.");
            return;
        }

        if (!title.trim()) {
            setError("Įveskite testo pavadinimą.");
            return;
        }

        if (!description.trim()) {
            setError("Įveskite testo aprašymą.");
            return;
        }

        if (questions.length === 0) {
            setError("Pridėkite bent vieną klausimą.");
            return;
        }

        if (
            questions.some(q =>
                !q.text.trim() ||
                q.answers.length !== 4 ||
                q.answers.some(a => !a.trim()) ||
                !Number.isInteger(q.taskai) ||
                q.taskai <= 0 ||
                q.correctAnswer < 0 ||
                q.correctAnswer > 3
            )
        ) {
            setError("Užpildykite visus klausimus, atsakymus ir taškus.");
            return;
        }

        const testData = {
            dalykas: dalykas,
            pamokos_pavadinimas: pamokosPavadinimas.trim(),
            pavadinimas: title.trim(),
            aprasymas: description.trim(),

            klausimai: questions.map(q => ({
                klausimas: q.text.trim(),
                a: q.answers[0].trim(),
                b: q.answers[1].trim(),
                c: q.answers[2].trim(),
                d: q.answers[3].trim(),
                atsakymas: ["A", "B", "C", "D"][q.correctAnswer],
                taskai: q.taskai
            }))
        };

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/tests",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(testData)
                }
            );

            const responseText = await response.text();

            let result: {
                message?: string;
                testo_id?: number;
                pamokos_id?: number;
            } = {};

            try {
                result = JSON.parse(responseText);
            } catch {
                throw new Error(
                    responseText || "Serveris grąžino netinkamą atsakymą."
                );
            }

            if (!response.ok) {
                throw new Error(
                    result.message || "Nepavyko išsaugoti testo."
                );
            }

            await Swal.fire({
                title: "Pavyko!",
                text: "Testas sėkmingai išsaugotas duomenų bazėje.",
                icon: "success",
                confirmButtonText: "Gerai",
                confirmButtonColor: "#8E3EE6"
            });

            // IŠVALOME FORMĄ
            setDalykas("");
            setPamokosPavadinimas("");
            setTitle("");
            setDescription("");
            setQuestions([createEmptyQuestion()]);

        } catch (err) {
            console.error("Testo išsaugojimo klaida:", err);

            await Swal.fire({
                title: "Klaida!",
                text: err instanceof Error
                    ? err.message
                    : "Nepavyko išsaugoti testo.",
                icon: "error",
                confirmButtonColor: "#8E3EE6"
            });

        } finally {
            setLoading(false);
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

                    <Link to="/theoryCreate" className="menu-link" style={{fontWeight: 'bold', color: '#8E3EE6'}}>
                        Nauja teorinė medžiaga +
                    </Link>

                    <Link to="/testCreate" className="menu-link"  style={{ fontWeight: "bold" }}>
                        Naujas testas +
                    </Link>

                    <Link to="/profile" className="menu-link">
                        Profilis
                    </Link>

                    <Link to="/" className="menu-link" style={{ color: "red" }}>
                        Atsijungti
                    </Link>
                </aside>

                <section className="theory-content">
                    <form
                        className="theory-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="theory-heading">
                            <h1>Naujo testo kūrimas</h1>

                            <p>
                                Pasirinkite dalyką ir pamokos temą,
                                tada sukurkite mokiniams skirtą testą.
                            </p>
                        </div>

                        {/* DALYKO PASIRINKIMAS */}
                        <div className="theory-field">
                            <label htmlFor="dalykas">
                                Dalykas
                            </label>

                            <select
                                id="dalykas"
                                value={dalykas}
                                onChange={e => setDalykas(e.target.value)}
                                required
                            >
                                <option value="">
                                    Pasirinkite dalyką
                                </option>

                                {dalykai.map(d => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* PAMOKOS TEMA */}
                        <div className="theory-field">
                            <label htmlFor="pamokosPavadinimas">
                                Tema
                            </label>

                            <input
                                id="pamokosPavadinimas"
                                type="text"
                                placeholder="Pamokos tema"
                                value={pamokosPavadinimas}
                                onChange={e =>
                                    setPamokosPavadinimas(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="theory-divider"></div>

                        {/* TESTO PAVADINIMAS */}
                        <div className="theory-field">
                            <label htmlFor="title">
                                Testo pavadinimas
                            </label>

                            <input
                                id="title"
                                type="text"
                                placeholder="Pvz. Programavimo pagrindai"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* TESTO APRAŠYMAS */}
                        <div className="theory-field">
                            <label htmlFor="description">
                                Testo aprašymas
                            </label>

                            <textarea
                                id="description"
                                placeholder="Trumpai aprašykite testą..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                style={{ minHeight: "100px" }}
                                required
                            />
                        </div>

                        <div className="theory-divider"></div>

                        <h2>Testo klausimai</h2>

                        {questions.map((question, index) => (
                            <div
                                className="test-question"
                                key={question.id}
                            >
                                <div className="test-question-header">
                                    <h3>
                                        Klausimas {index + 1}
                                    </h3>

                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            className="test-remove"
                                            onClick={() =>
                                                removeQuestion(question.id)
                                            }
                                        >
                                            Pašalinti
                                        </button>
                                    )}
                                </div>

                                {/* KLAUSIMO TEKSTAS */}
                                <div className="theory-field">
                                    <label>
                                        Klausimo tekstas
                                    </label>

                                    <textarea
                                        placeholder="Įrašykite klausimą..."
                                        value={question.text}
                                        onChange={e =>
                                            updateQuestion(
                                                question.id,
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>

                                {/* ATSAKYMŲ VARIANTAI */}
                                <label className="test-answer-label">
                                    Atsakymo variantai
                                </label>

                                {question.answers.map((answer, i) => (
                                    <div
                                        className="test-answer"
                                        key={i}
                                    >
                                        <input
                                            type="radio"
                                            name={`correct-${question.id}`}
                                            checked={question.correctAnswer === i}
                                            onChange={() =>
                                                setCorrectAnswer(
                                                    question.id,
                                                    i
                                                )
                                            }
                                        />

                                        <span>
                                            {String.fromCharCode(65 + i)}.
                                        </span>

                                        <input
                                            type="text"
                                            placeholder={`Atsakymas ${i + 1}`}
                                            value={answer}
                                            onChange={e =>
                                                updateAnswer(
                                                    question.id,
                                                    i,
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                ))}

                                <p className="theory-hint">
                                    Pasirinkite teisingą atsakymą
                                    pažymėdami apskritimą.
                                </p>

                                {/* KLAUSIMO TAŠKAI */}
                                <div className="theory-field">
                                    <label>
                                        Klausimo taškai
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={question.taskai}
                                        onChange={e =>
                                            updatePoints(
                                                question.id,
                                                Number(e.target.value)
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            className="test-add-question"
                            onClick={addQuestion}
                        >
                            + Pridėti klausimą
                        </button>

                        {error && (
                            <p className="theory-error">
                                {error}
                            </p>
                        )}

                        <div className="theory-divider"></div>

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
                                {loading ? "Išsaugoma..." : "Išsaugoti"}
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

export default TestCreate;