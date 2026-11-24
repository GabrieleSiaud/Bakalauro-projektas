package handlers

import (
	"encoding/json"
	"log"
	"net/http"
)

type TheoryReadItem struct {
	ID          int64  `json:"id"`
	Dalykas     string `json:"dalykas"`
	Pavadinimas string `json:"pavadinimas"`
	Turinys     string `json:"turinys"`
	Vardas      string `json:"vardas"`
	Pavarde     string `json:"pavarde"`
}

func (h *Handler) GetTheories(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		theoryError(w, http.StatusMethodNotAllowed, "Leidžiamas tik GET metodas")
		return
	}
	mokinysID, err := h.getTeacherID(r)

	if err != nil {
		theoryError(w, http.StatusUnauthorized, "Neprisijungęs naudotojas")
		return
	}

	var role string

	err = h.DB.QueryRow(
		r.Context(),
		"SELECT role FROM naudotojas WHERE id = $1",
		mokinysID,
	).Scan(&role)

	if err != nil {
		log.Println("NAUDOTOJO ROLĖS KLAIDA:", err)
		theoryError(w, http.StatusInternalServerError, "Nepavyko patikrinti naudotojo")
		return
	}

	if role != "mokinys" {
		theoryError(w, http.StatusForbidden, "Šis puslapis skirtas mokiniams")
		return
	}

	rows, err := h.DB.Query(
		r.Context(),
		`SELECT
			t.id,
			p.dalykas,
			t.pavadinimas,
			t.turinys,
			n.vardas,
			n.pavarde
		FROM teorija t
		JOIN pamoka p ON p.id = t.pamokos_id
		JOIN naudotojas n ON n.id = p.naudotojo_id
		WHERE n.role = 'mokytojas'
		ORDER BY t.id DESC`,
	)

	if err != nil {
		log.Println("TEORIJOS NUSKAITYMO KLAIDA:", err)
		theoryError(w, http.StatusInternalServerError, "Nepavyko gauti teorinės medžiagos")
		return
	}
	defer rows.Close()

	teorijos := []TheoryReadItem{}

	for rows.Next() {
		var t TheoryReadItem

		err := rows.Scan(
			&t.ID,
			&t.Dalykas,
			&t.Pavadinimas,
			&t.Turinys,
			&t.Vardas,
			&t.Pavarde,
		)

		if err != nil {
			log.Println("TEORIJOS DUOMENŲ SKAITYMO KLAIDA:", err)
			theoryError(w, http.StatusInternalServerError, "Nepavyko nuskaityti teorijos")
			return
		}

		teorijos = append(teorijos, t)
	}

	if err := rows.Err(); err != nil {
		log.Println("TEORIJOS ITERACIJOS KLAIDA:", err)
		theoryError(w, http.StatusInternalServerError, "Nepavyko gauti teorinės medžiagos")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(teorijos)
}
