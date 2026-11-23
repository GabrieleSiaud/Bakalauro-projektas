package handlers

import (
	"encoding/json"
	"log"
	"net/http"
)

type TeacherTheoryItem struct {
	ID          int64  `json:"id"`
	Dalykas     string `json:"dalykas"`
	Pavadinimas string `json:"pavadinimas"`
}

type TeacherTestItem struct {
	ID               int64  `json:"id"`
	Dalykas          string `json:"dalykas"`
	Pavadinimas      string `json:"pavadinimas"`
	Aprasymas        string `json:"aprasymas"`
	KlausimuSkaicius int64  `json:"klausimu_skaicius"`
}

type TeacherContentResponse struct {
	Teorijos []TeacherTheoryItem `json:"teorijos"`
	Testai   []TeacherTestItem   `json:"testai"`
}

// PRISIJUNGUSIO MOKYTOJO TEORIJA IR TESTAI (profilio puslapiui)
func (h *Handler) GetTeacherContent(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		testError(
			w,
			http.StatusMethodNotAllowed,
			"Leidžiamas tik GET metodas",
		)
		return
	}

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

	// tušti masyvai, kad JSON būtų [] o ne null
	result := TeacherContentResponse{
		Teorijos: []TeacherTheoryItem{},
		Testai:   []TeacherTestItem{},
	}

	// TEORIJA
	teorijaRows, err := h.DB.Query(
		r.Context(),
		`SELECT t.id, p.dalykas, p.pavadinimas
         FROM teorija t
         JOIN pamoka p ON p.id = t.pamokos_id
         WHERE p.naudotojo_id = $1
         ORDER BY t.id DESC`,
		mokytojoID,
	)
	if err != nil {
		log.Println("TEORIJOS NUSKAITYMO KLAIDA:", err)

		testError(
			w,
			http.StatusInternalServerError,
			"Nepavyko gauti teorinės medžiagos",
		)
		return
	}
	defer teorijaRows.Close()

	for teorijaRows.Next() {
		var t TeacherTheoryItem

		err = teorijaRows.Scan(&t.ID, &t.Dalykas, &t.Pavadinimas)
		if err != nil {
			log.Println("TEORIJOS SKAITYMO KLAIDA:", err)

			testError(
				w,
				http.StatusInternalServerError,
				"Nepavyko gauti teorinės medžiagos",
			)
			return
		}

		result.Teorijos = append(result.Teorijos, t)
	}

	if err = teorijaRows.Err(); err != nil {
		log.Println("TEORIJOS ITERACIJOS KLAIDA:", err)

		testError(
			w,
			http.StatusInternalServerError,
			"Nepavyko gauti teorinės medžiagos",
		)
		return
	}

	// TESTAI
	testaiRows, err := h.DB.Query(
		r.Context(),
		`SELECT t.id,
                p.dalykas,
                t.pavadinimas,
                COALESCE(t.aprasymas, ''),
                COUNT(k.id)
         FROM testas t
         JOIN pamoka p ON p.id = t.pamokos_id
         LEFT JOIN klausimai k ON k.testo_id = t.id
         WHERE p.naudotojo_id = $1
         GROUP BY t.id, p.id
         ORDER BY t.id DESC`,
		mokytojoID,
	)
	if err != nil {
		log.Println("TESTŲ NUSKAITYMO KLAIDA:", err)

		testError(
			w,
			http.StatusInternalServerError,
			"Nepavyko gauti testų",
		)
		return
	}
	defer testaiRows.Close()

	for testaiRows.Next() {
		var t TeacherTestItem

		err = testaiRows.Scan(
			&t.ID,
			&t.Dalykas,
			&t.Pavadinimas,
			&t.Aprasymas,
			&t.KlausimuSkaicius,
		)
		if err != nil {
			log.Println("TESTO SKAITYMO KLAIDA:", err)

			testError(
				w,
				http.StatusInternalServerError,
				"Nepavyko gauti testų",
			)
			return
		}

		result.Testai = append(result.Testai, t)
	}

	if err = testaiRows.Err(); err != nil {
		log.Println("TESTŲ ITERACIJOS KLAIDA:", err)

		testError(
			w,
			http.StatusInternalServerError,
			"Nepavyko gauti testų",
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(result)
}
