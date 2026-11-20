package handlers

import (
	"encoding/json"
	"net/http"
)

type TestQuestion struct {
	Klausimas string `json:"klausimas"`
	A         string `json:"a"`
	B         string `json:"b"`
	C         string `json:"c"`
	Atsakymas string `json:"atsakymas"`
	Taskai    int    `json:"taskai"`
}

type CreateTestRequest struct {
	Pavadinimas string         `json:"pavadinimas"`
	PamokosID   int64          `json:"pamokos_id"`
	Aprasymas   string         `json:"aprasymas"`
	Klausimai   []TestQuestion `json:"klausimai"`
}

func (h *Handler) CreateTest(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Neleidžiamas metodas", http.StatusMethodNotAllowed)
		return
	}

	mokytojoID, err := h.getTeacherID(r)
	if err != nil {
		http.Error(w, "Neprisijungęs naudotojas", http.StatusUnauthorized)
		return
	}

	var req CreateTestRequest

	if err != nil {
		http.Error(w, "Netinkami duomenys", http.StatusBadRequest)
		return
	}

	if req.Pavadinimas == "" || req.PamokosID <= 0 || len(req.Klausimai) == 0 {
		http.Error(w, "Užpildykite testo pavadinimą, pamoką ir klausimus", http.StatusBadRequest)
		return
	}

	for i, k := range req.Klausimai {
		if k.Klausimas == "" ||
			k.A == "" ||
			k.B == "" ||
			k.C == "" ||
			(k.Atsakymas != "A" && k.Atsakymas != "B" && k.Atsakymas != "C") ||
			k.Taskai <= 0 {

			http.Error(
				w,
				"Netinkamai užpildytas klausimas",
				http.StatusBadRequest,
			)
			_ = i
			return
		}
	}

	var pamokosID int64

	err = h.DB.QueryRow(
		r.Context(),
		`SELECT id FROM pamoka
         WHERE id = $1 AND naudotojo_id = $2`,
		req.PamokosID,
		mokytojoID,
	).Scan(&pamokosID)

	if err != nil {
		http.Error(w, "Pamoka nerasta arba nepriklauso mokytojui", http.StatusForbidden)
		return
	}

	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		http.Error(w, "Nepavyko pradėti išsaugojimo", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())

	var testoID int64

	err = tx.QueryRow(
		r.Context(),
		`INSERT INTO testas (pavadinimas, aprasymas, pamokos_id)
         VALUES ($1, $2, $3)
         RETURNING id`,
		req.Pavadinimas,
		req.Aprasymas,
		req.PamokosID,
	).Scan(&testoID)

	if err != nil {
		http.Error(w, "Nepavyko sukurti testo", http.StatusInternalServerError)
		return
	}

	for _, k := range req.Klausimai {
		_, err = tx.Exec(
			r.Context(),
			`INSERT INTO klausimai
             (testo_id, klausimas, avariantas, bvariantas,
              cvariantas, atsakymas, taskai)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			testoID,
			k.Klausimas,
			k.A,
			k.B,
			k.C,
			k.Atsakymas,
			k.Taskai,
		)

		if err != nil {
			http.Error(w, "Nepavyko išsaugoti klausimų", http.StatusInternalServerError)
			return
		}
	}

	err = tx.Commit(r.Context())
	if err != nil {
		http.Error(w, "Nepavyko išsaugoti testo", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "Testas sėkmingai sukurtas",
		"testo_id": testoID,
	})
}

func (h *Handler) GetTeacherLessons(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Neleidžiamas metodas", http.StatusMethodNotAllowed)
		return
	}

	rows, err := h.DB.Query(
		r.Context(),
		`SELECT id, dalykas, pavadinimas
         FROM pamoka
         WHERE naudotojo_id = $1
         ORDER BY id DESC`,
	)

	if err != nil {
		http.Error(w, "Nepavyko gauti pamokų", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type Lesson struct {
		ID          int64  `json:"id"`
		Dalykas     string `json:"dalykas"`
		Pavadinimas string `json:"pavadinimas"`
	}

	pamokos := []Lesson{}

	for rows.Next() {
		var p Lesson

		err := rows.Scan(&p.ID, &p.Dalykas, &p.Pavadinimas)
		if err != nil {
			http.Error(w, "Nepavyko nuskaityti pamokų", http.StatusInternalServerError)
			return
		}

		pamokos = append(pamokos, p)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Nepavyko gauti pamokų", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pamokos)
}
