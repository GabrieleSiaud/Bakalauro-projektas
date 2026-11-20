
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
}

function TestCreate() {
    const [dalykas, setDalykas] = useState("");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    const [questions, setQuestions] = useState<Question[]>([
        {
            id: 1,
            text: "",
            answers: ["", "", "", ""],
            correctAnswer: 0
        }
    ]);

    // PRIDĖTI KLAUSIMĄ
    const addQuestion = () => {
        setQuestions(prev => [
            ...prev,
            {
                id: Date.now(),
                text: "",
                answers: ["", "", "", ""],
                correctAnswer: 0
            }
        ]);
    };

    // PAŠALINTI KLAUSIMĄ
    const removeQuestion = (id: number) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
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

    // IŠSAUGOTI TESTĄ
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!dalykas) {
            setError("Pasirinkite dalyką.");
            return;
        }

        if (!title.trim()) {
            setError("Įveskite testo pavadinimą.");
            return;
        }

        if (
            questions.some(q =>
                !q.text.trim() ||
                q.answers.some(a => !a.trim())
            )
        ) {
            setError("Užpildykite visus klausimus ir atsakymus.");
            return;
        }

        const testData = {
            dalykas: dalykas,
            pavadinimas: title.trim(),
            aprasymas: description.trim(),
            klausimai: questions.map(q => ({
                klausimas: q.text.trim(),
                atsakymai: q.answers.map(a => a.trim()),
                teisingas_atsakymas: q.correctAnswer
            }))
        };

        console.log("Testo duomenys:", testData);

        await Swal.fire({
            title: "Testo duomenys paruošti!",
            text: "Pasirinktas dalykas ir testo duomenys paruošti išsaugojimui.",
            icon: "success",
            confirmButtonText: "Gerai",
            confirmButtonColor: "#8E3EE6"
        });
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
                        style={{
                            fontWeight: "bold",
                            color: "#8E3EE6"
                        }}
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

                <section className="theory-content">

                    <form
                        className="theory-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="theory-heading">
                            <h1>Naujo testo kūrimas</h1>
                            <p>
                                Pasirinkite dalyką ir sukurkite
                                mokiniams skirtą testą.
                            </p>
                        </div>

                        {/* DALYKO PASIRINKIMAS */}
                        <div className="theory-field">

                            <label htmlFor="dalykas">
                                Pasirinkite dalyką
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

                                <option value="Matematika">
                                    Matematika
                                </option>

                                <option value="Informatika">
                                    Informatika
                                </option>

                                <option value="Lietuvių kalba">
                                    Lietuvių kalba
                                </option>

                                <option value="Anglų kalba">
                                    Anglų kalba
                                </option>

                                <option value="Istorija">
                                    Istorija
                                </option>

                                <option value="Biologija">
                                    Biologija
                                </option>

                                <option value="Fizika">
                                    Fizika
                                </option>

                                <option value="Chemija">
                                    Chemija
                                </option>

                                <option value="Kitas">
                                    Kitas
                                </option>
                            </select>

                        </div>

                        {/* TESTO PAVADINIMAS */}
                        <div className="theory-field">

                            <label htmlFor="title">
                                Testo pavadinimas
                            </label>

                            <input
                                id="title"
                                type="text"
                                placeholder="Pvz. Lietuvos istorija"
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
                            >
                                Išsaugoti
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
