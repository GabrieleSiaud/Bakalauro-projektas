package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

type TestQuestion struct {
	Klausimas string `json:"klausimas"`
	A         string `json:"a"`
	B         string `json:"b"`
	C         string `json:"c"`
	D         string `json:"d"`
	Atsakymas string `json:"atsakymas"`
	Taskai    int    `json:"taskai"`
}

type CreateTestRequest struct {
	Dalykas     string         `json:"dalykas"`
	Pavadinimas string         `json:"pavadinimas"`
	Aprasymas   string         `json:"aprasymas"`
	Klausimai   []TestQuestion `json:"klausimai"`
}

// JSON klaidų grąžinimas frontend puslapiui
func testError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	json.NewEncoder(w).Encode(map[string]string{
		"message": message,
	})
}

// TESTO SUKŪRIMAS
func (h *Handler) CreateTest(w http.ResponseWriter, r *http.Request) {

	// Tikriname HTTP metodą
	if r.Method != http.MethodPost {
		testError(
			w,
			http.StatusMethodNotAllowed,
			"Leidžiamas tik POST metodas",
		)
		return
	}

	// Tikriname prisijungusį mokytoją
	mokytojoID, err := h.getTeacherID(r)
	if err != nil {
		log.Println("MOKYTOJO ID KLAIDA:", err)

		testError(
			w,
			http.StatusUnauthorized,
			"Neprisijungęs naudotojas",
		)
		return
	}

	// Tikriname naudotojo rolę
	var role string

	err = h.DB.QueryRow(
		r.Context(),
		"SELECT role FROM naudotojas WHERE id=$1",
		mokytojoID,
	).Scan(&role)

	if err != nil {
		log.Println("ROLĖS TIKRINIMO KLAIDA:", err)

		testError(
			w,
			http.StatusInternalServerError,
			"Nepavyko patikrinti naudotojo",
		)
		return
	}

	if role != "mokytojas" {
		testError(
			w,
			http.StatusForbidden,
			"Tik mokytojas gali kurti testus",
		)
		return
	}

	// Nuskaitome JSON duomenis
	var req CreateTestRequest

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	err = decoder.Decode(&req)
	if err != nil {
		log.Println("JSON NUSKAITYMO KLAIDA:", err)

		testError(
			w,
			http.StatusBadRequest,
			"Netinkami pateikti duomenys",
		)
		return
	}

	// Tikriname pagrindinius laukus
	req.Dalykas = strings.TrimSpace(req.Dalykas)
	req.Pavadinimas = strings.TrimSpace(req.Pavadinimas)
	req.Aprasymas = strings.TrimSpace(req.Aprasymas)

	if req.Dalykas == "" ||
		req.Pavadinimas == "" ||
		req.Aprasymas == "" {

		testError(
			w,
			http.StatusBadRequest,
			"Užpildykite visus privalomus laukus",
		)
		return
	}

	if len(req.Klausimai) == 0 {
		testError(
			w,
			http.StatusBadRequest,
			"Pridėkite bent vieną klausimą",
		)
		return
	}

	// Tikriname klausimus ir atsakymus
	for i := range req.Klausimai {
		k := &req.Klausimai[i]

		k.Klausimas = strings.TrimSpace(k.Klausimas)
		k.A = strings.TrimSpace(k.A)
		k.B = strings.TrimSpace(k.B)
		k.C = strings.TrimSpace(k.C)
		k.D = strings.TrimSpace(k.D)
		k.Atsakymas = strings.ToUpper(strings.TrimSpace(k.Atsakymas))

		if k.Klausimas == "" ||
			k.A == "" ||
			k.B == "" ||
			k.C == "" ||
			k.D == "" {

			testError(
				w,
				http.StatusBadRequest,
				"Užpildykite visus klausimų atsakymus",
			)
			return
		}

		if k.Atsakymas != "A" &&
			k.Atsakymas != "B" &&
			k.Atsakymas != "C" &&
			k.Atsakymas != "D" {

			testError(
				w,
				http.StatusBadRequest,
				"Pasirinkite teisingą atsakymą",
			)
			return
		}

		if k.Taskai <= 0 {
			testError(
				w,
				http.StatusBadRequest,
				"Klausimo taškai turi būti didesni už nulį",
			)
			return
		}
	}

	// Pradedame duomenų bazės transakciją
	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		log.Println("TRANSAKCIJOS PRADŽIOS KLAIDA:", err)

		testError(
			w,
			http.StatusInternalServerError,
			"Nepavyko pradėti išsaugojimo",
		)
		return
	}

	defer tx.Rollback(r.Context())

	// Ieškome šio mokytojo pamokos pagal pasirinktą dalyką (0 = nerasta)
	var pamokosID int64

	err = tx.QueryRow(
		r.Context(),
		`SELECT COALESCE(
            (
                SELECT id
                FROM pamoka
                WHERE dalykas = $1
                  AND pavadinimas = $1
                  AND naudotojo_id = $2
                ORDER BY id
                LIMIT 1
            ),
            0
        )`,
		req.Dalykas,
		mokytojoID,
	).Scan(&pamokosID)

	if err != nil {
		log.Println("PAMOKOS PAIEŠKOS KLAIDA:", err)

		testError(
			w,
			http.StatusInternalServerError,
			"Nepavyko patikrinti pamokos",
		)
		return
	}

	// Jei tokios pamokos dar nėra – įrašome ją į duomenų bazę
	if pamokosID == 0 {
		err = tx.QueryRow(
			r.Context(),
			`INSERT INTO pamoka (dalykas, pavadinimas, naudotojo_id)
             VALUES ($1, $1, $2)
             RETURNING id`,
			req.Dalykas,
			mokytojoID,
		).Scan(&pamokosID)

		if err != nil {
			log.Println("PAMOKOS SUKŪRIMO KLAIDA:", err)

			testError(
				w,
				http.StatusInternalServerError,
				"Nepavyko sukurti pamokos",
			)
			return
		}
	}

	// Sukuriame testą
	var testoID int64

	err = tx.QueryRow(
		r.Context(),
		`INSERT INTO testas (pavadinimas, aprasymas, pamokos_id)
         VALUES ($1, $2, $3)
         RETURNING id`,
		req.Pavadinimas,
		req.Aprasymas,
		pamokosID,
	).Scan(&testoID)

	if err != nil {
		log.Println("TESTO SUKŪRIMO KLAIDA:", err)

		testError(
			w,
			http.StatusInternalServerError,
			"Nepavyko sukurti testo",
		)
		return
	}

	// Išsaugome visus testo klausimus
	for _, k := range req.Klausimai {

		_, err = tx.Exec(
			r.Context(),
			`INSERT INTO klausimai
            (
                testo_id,
                klausimas,
                avariantas,
                bvariantas,
                cvariantas,
                dvariantas,
                atsakymas,
                taskai
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
			testoID,
			k.Klausimas,
			k.A,
			k.B,
			k.C,
			k.D,
			k.Atsakymas,
			k.Taskai,
		)

		if err != nil {
			log.Println("KLAUSIMO IŠSAUGOJIMO KLAIDA:", err)

			testError(
				w,
				http.StatusInternalServerError,
				"Nepavyko išsaugoti testo klausimų",
			)
			return
		}
	}

	// Patvirtiname transakciją
	err = tx.Commit(r.Context())

	if err != nil {
		log.Println("COMMIT KLAIDA:", err)

		testError(
			w,
			http.StatusInternalServerError,
			"Nepavyko galutinai išsaugoti duomenų",
		)
		return
	}

	log.Println("TESTAS SĖKMINGAI IŠSAUGOTAS")
	log.Println("Pamokos ID:", pamokosID)
	log.Println("Testo ID:", testoID)
	log.Println("Mokytojo ID:", mokytojoID)

	// Grąžiname sėkmingą atsakymą
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":    "Testas sėkmingai išsaugotas",
		"pamokos_id": pamokosID,
		"testo_id":   testoID,
	})
}
