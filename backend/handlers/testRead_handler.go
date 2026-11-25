package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
)

type TestReadItem struct {
	ID          int64  `json:"id"`
	Dalykas     string `json:"dalykas"`
	Pavadinimas string `json:"pavadinimas"`
	Aprasymas   string `json:"aprasymas"`
	Vardas      string `json:"vardas"`
	Pavarde     string `json:"pavarde"`
}

type TestReadQuestion struct {
	ID         int64  `json:"id"`
	Klausimas  string `json:"klausimas"`
	AVariantas string `json:"avariantas"`
	BVariantas string `json:"bvariantas"`
	CVariantas string `json:"cvariantas"`
	DVariantas string `json:"dvariantas"`
	Taskai     int    `json:"taskai"`
}

// Mokinio pateikiamas atsakymas
type StudentAnswer struct {
	KlausimoID int64  `json:"klausimo_id"`
	Variantas  string `json:"variantas"`
}

// Atsakymų pateikimo užklausa
type SubmitTestRequest struct {
	Atsakymai []StudentAnswer `json:"atsakymai"`
}

// Testo rezultatas
type TestResult struct {
	SurinktiTaskai int    `json:"surinkti_taskai"`
	MaxTaskai      int    `json:"max_taskai"`
	Statusas       string `json:"statusas"`
}

// Patikrinama, ar prisijungęs naudotojas yra mokinys
func (h *Handler) checkStudent(r *http.Request) (int, error) {
	userID, err := h.getTeacherID(r)
	if err != nil {
		return 0, err
	}

	var role string

	err = h.DB.QueryRow(
		r.Context(),
		`SELECT role FROM naudotojas WHERE id = $1`,
		userID,
	).Scan(&role)

	if err != nil {
		return 0, err
	}

	if role != "mokinys" {
		return 0, pgx.ErrNoRows
	}

	return userID, nil
}

// Gaunami visi mokytojų sukurti testai
func (h *Handler) GetTests(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		testError(w, http.StatusMethodNotAllowed, "Leidžiamas tik GET metodas")
		return
	}

	_, err := h.checkStudent(r)

	if err != nil {
		testError(w, http.StatusUnauthorized, "Neprisijungęs mokinys")
		return
	}

	rows, err := h.DB.Query(
		r.Context(),
		`
SELECT
t.id,
p.dalykas,
t.pavadinimas,
COALESCE(t.aprasymas, ''),
n.vardas,
n.pavarde
FROM testas t
JOIN pamoka p ON p.id = t.pamokos_id
JOIN naudotojas n ON n.id = p.naudotojo_id
WHERE n.role = 'mokytojas'
ORDER BY t.id DESC
`,
	)

	if err != nil {
		log.Println("TESTŲ NUSKAITYMO KLAIDA:", err)
		testError(w, http.StatusInternalServerError, "Nepavyko gauti testų")
		return
	}

	defer rows.Close()

	testai := []TestReadItem{}

	for rows.Next() {
		var t TestReadItem

		err := rows.Scan(
			&t.ID,
			&t.Dalykas,
			&t.Pavadinimas,
			&t.Aprasymas,
			&t.Vardas,
			&t.Pavarde,
		)

		if err != nil {
			log.Println("TESTO DUOMENŲ KLAIDA:", err)
			testError(w, http.StatusInternalServerError, "Nepavyko nuskaityti testų")
			return
		}

		testai = append(testai, t)
	}

	if err := rows.Err(); err != nil {
		log.Println("TESTŲ ITERACIJOS KLAIDA:", err)
		testError(w, http.StatusInternalServerError, "Nepavyko gauti testų")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(testai)
}

// Gaunami pasirinkto testo klausimai
func (h *Handler) GetTestQuestions(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		testError(w, http.StatusMethodNotAllowed, "Leidžiamas tik GET metodas")
		return
	}

	_, err := h.checkStudent(r)

	if err != nil {
		testError(w, http.StatusUnauthorized, "Neprisijungęs mokinys")
		return
	}

	testID, err := getTestID(r, false)

	if err != nil {
		testError(w, http.StatusBadRequest, "Neteisingas testo ID")
		return
	}

	// Tikrinama, ar testas priklauso mokytojo pamokai
	var exists bool

	err = h.DB.QueryRow(
		r.Context(),
		`
SELECT EXISTS (
SELECT 1
FROM testas t
JOIN pamoka p ON p.id = t.pamokos_id
JOIN naudotojas n ON n.id = p.naudotojo_id
WHERE t.id = $1 AND n.role = 'mokytojas'
)
`,
		testID,
	).Scan(&exists)

	if err != nil || !exists {
		testError(w, http.StatusNotFound, "Testas nerastas")
		return
	}

	rows, err := h.DB.Query(
		r.Context(),
		`
    SELECT
        id,
        klausimas,
        avariantas,
        bvariantas,
        cvariantas,
        dvariantas,
        taskai
    FROM klausimai
    WHERE testo_id = $1
    ORDER BY id
    `,
		testID,
	)

	if err != nil {
		log.Println("KLAUSIMŲ NUSKAITYMO KLAIDA:", err)
		testError(w, http.StatusInternalServerError, "Nepavyko gauti klausimų")
		return
	}

	defer rows.Close()

	klausimai := []TestReadQuestion{}

	for rows.Next() {
		var k TestReadQuestion

		err := rows.Scan(
			&k.ID,
			&k.Klausimas,
			&k.AVariantas,
			&k.BVariantas,
			&k.CVariantas,
			&k.DVariantas,
			&k.Taskai,
		)

		if err != nil {
			log.Println("KLAUSIMO DUOMENŲ KLAIDA:", err)
			testError(w, http.StatusInternalServerError, "Nepavyko nuskaityti klausimų")
			return
		}

		klausimai = append(klausimai, k)
	}

	if err := rows.Err(); err != nil {
		log.Println("KLAUSIMŲ ITERACIJOS KLAIDA:", err)
		testError(w, http.StatusInternalServerError, "Nepavyko gauti klausimų")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"klausimai": klausimai,
	})
}

// Išsaugomi mokinio atsakymai ir apskaičiuojamas rezultatas
func (h *Handler) SubmitTest(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		testError(w, http.StatusMethodNotAllowed, "Leidžiamas tik POST metodas")
		return
	}

	mokinysID, err := h.checkStudent(r)

	if err != nil {
		testError(w, http.StatusUnauthorized, "Neprisijungęs mokinys")
		return
	}

	testID, err := getTestID(r, true)

	if err != nil {
		testError(w, http.StatusBadRequest, "Neteisingas testo ID")
		return
	}

	var req SubmitTestRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		testError(w, http.StatusBadRequest, "Netinkami atsakymų duomenys")
		return
	}

	if len(req.Atsakymai) == 0 {
		testError(w, http.StatusBadRequest, "Nepateikti atsakymai")
		return
	}

	// Pradedama duomenų bazės transakcija
	tx, err := h.DB.Begin(r.Context())

	if err != nil {
		log.Println("TRANSAKCIJOS KLAIDA:", err)
		testError(w, http.StatusInternalServerError, "Nepavyko pradėti testo pateikimo")
		return
	}

	defer tx.Rollback(r.Context())

	// Patikrinama, ar testas egzistuoja
	var exists bool

	err = tx.QueryRow(
		r.Context(),
		`
SELECT EXISTS (
SELECT 1
FROM testas t
JOIN pamoka p ON p.id = t.pamokos_id
JOIN naudotojas n ON n.id = p.naudotojo_id
WHERE t.id = $1 AND n.role = 'mokytojas'
)
`,
		testID,
	).Scan(&exists)

	if err != nil || !exists {
		testError(w, http.StatusNotFound, "Testas nerastas")
		return
	}

	// Gaunami visi testo klausimai ir teisingi atsakymai
	rows, err := tx.Query(
		r.Context(),
		`
SELECT id, atsakymas, taskai
FROM klausimai
WHERE testo_id = $1
FOR UPDATE
`,
		testID,
	)

	if err != nil {
		log.Println("KLAUSIMŲ TIKRINIMO KLAIDA:", err)
		testError(w, http.StatusInternalServerError, "Nepavyko patikrinti klausimų")
		return
	}

	type CorrectAnswer struct {
		Atsakymas string
		Taskai    int
	}

	teisingiAtsakymai := make(map[int64]CorrectAnswer)

	maxTaskai := 0

	for rows.Next() {
		var id int64
		var atsakymas string
		var taskai int

		if err := rows.Scan(&id, &atsakymas, &taskai); err != nil {
			rows.Close()
			testError(w, http.StatusInternalServerError, "Nepavyko nuskaityti klausimų")
			return
		}

		teisingiAtsakymai[id] = CorrectAnswer{
			Atsakymas: strings.TrimSpace(atsakymas),
			Taskai:    taskai,
		}

		maxTaskai += taskai
	}

	if err := rows.Err(); err != nil {
		rows.Close()
		testError(w, http.StatusInternalServerError, "Nepavyko gauti klausimų")
		return
	}

	rows.Close()

	if len(teisingiAtsakymai) == 0 {
		testError(w, http.StatusBadRequest, "Testas neturi klausimų")
		return
	}

	if len(req.Atsakymai) != len(teisingiAtsakymai) {
		testError(w, http.StatusBadRequest, "Privaloma atsakyti į visus klausimus")
		return
	}

	// Tikrinami mokinio atsakymai
	surinktiTaskai := 0
	ivestiAtsakymai := make(map[int64]bool)

	for _, ats := range req.Atsakymai {

		if ats.Variantas != "A" &&
			ats.Variantas != "B" &&
			ats.Variantas != "C" &&
			ats.Variantas != "D" {
			testError(w, http.StatusBadRequest, "Netinkamas atsakymo variantas")
			return
		}
		teisingas, ok := teisingiAtsakymai[ats.KlausimoID]

		if !ok || ivestiAtsakymai[ats.KlausimoID] {
			testError(w, http.StatusBadRequest, "Neteisingas arba pasikartojantis klausimas")
			return
		}

		ivestiAtsakymai[ats.KlausimoID] = true

		if ats.Variantas == teisingas.Atsakymas {
			surinktiTaskai += teisingas.Taskai
		}
	}

	// Nustatomas testo statusas (išlaikytas nuo 50 %)
	statusas := "neišlaikyta"

	if surinktiTaskai*100 >= maxTaskai*50 {
		statusas = "išlaikyta"
	}

	// Sukuriamas naujas testo bandymas
	var bandymoID int64

	err = tx.QueryRow(
		r.Context(),
		`
INSERT INTO testu_bandymai
(testo_id, naudotojo_id, surinkti_taskai, max_taskai, statusas)
VALUES ($1, $2, $3, $4, $5)
RETURNING id
`,
		testID,
		mokinysID,
		surinktiTaskai,
		maxTaskai,
		statusas,
	).Scan(&bandymoID)

	if err != nil {
		log.Println("BANDYMO IŠSAUGOJIMO KLAIDA:", err)
		testError(w, http.StatusInternalServerError, "Nepavyko išsaugoti testo bandymo")
		return
	}

	// Išsaugomi visi mokinio atsakymai
	for _, ats := range req.Atsakymai {

		_, err = tx.Exec(
			r.Context(),
			`
INSERT INTO mokinio_atsakymai
(bandymo_id, klausimo_id, variantas)
VALUES ($1, $2, $3)
`,
			bandymoID,
			ats.KlausimoID,
			ats.Variantas,
		)

		if err != nil {
			log.Println("ATSAKYMO IŠSAUGOJIMO KLAIDA:", err)
			testError(w, http.StatusInternalServerError, "Nepavyko išsaugoti atsakymų")
			return
		}
	}

	// Patvirtinama transakcija
	if err := tx.Commit(r.Context()); err != nil {
		log.Println("TRANSAKCIJOS PATVIRTINIMO KLAIDA:", err)
		testError(w, http.StatusInternalServerError, "Nepavyko pateikti testo")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(TestResult{
		SurinktiTaskai: surinktiTaskai,
		MaxTaskai:      maxTaskai,
		Statusas:       statusas,
	})
}

// Iš URL paimamas testo ID
func getTestID(r *http.Request, submit bool) (int64, error) {

	path := strings.TrimPrefix(r.URL.Path, "/api/tests/")
	parts := strings.Split(strings.Trim(path, "/"), "/")

	if len(parts) == 0 || parts[0] == "" {
		return 0, strconv.ErrSyntax
	}

	if submit {
		if len(parts) != 2 || parts[1] != "submit" {
			return 0, strconv.ErrSyntax
		}
	} else {
		if len(parts) != 1 {
			return 0, strconv.ErrSyntax
		}
	}

	id, err := strconv.ParseInt(parts[0], 10, 64)

	if err != nil || id <= 0 {
		return 0, strconv.ErrSyntax
	}

	return id, nil
}
