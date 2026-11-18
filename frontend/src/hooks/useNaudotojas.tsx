import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Naudotojo duomenų struktūra
export interface Naudotojas {
    id: number;
    vardas: string;
    pavarde: string;
    el_pastas: string;
    role: string;
}

// nukreiptiJeiNeprisijunges = true  -> neprisijungęs siunčiamas į /login
// nukreiptiJeiNeprisijunges = false -> tinka viešiems puslapiams (naudotojas tiesiog lieka null)
export function useNaudotojas(nukreiptiJeiNeprisijunges = true) {

    const navigate = useNavigate();

    const [naudotojas, setNaudotojas] = useState<Naudotojas | null>(null);
    const [klaida, setKlaida] = useState("");
    const [kraunama, setKraunama] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const gautiNaudotoja = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/me", {
                    method: "GET",
                    credentials: "include",
                    signal: controller.signal
                });

                // Neprisijungęs naudotojas
                if (response.status === 401) {
                    if (nukreiptiJeiNeprisijunges) {
                        navigate("/login");
                    }
                    return;
                }

                if (!response.ok) {
                    throw new Error("Nepavyko gauti profilio informacijos");
                }

                const data: Naudotojas = await response.json();
                setNaudotojas(data);

            } catch (error) {
                // Atšaukta užklausa (React StrictMode) – ne klaida
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }

                console.error(error);
                setKlaida("Nepavyko gauti profilio informacijos");

            } finally {
                if (!controller.signal.aborted) {
                    setKraunama(false);
                }
            }
        };

        gautiNaudotoja();

        return () => controller.abort();
    }, [navigate, nukreiptiJeiNeprisijunges]);

    return { naudotojas, klaida, kraunama };
}