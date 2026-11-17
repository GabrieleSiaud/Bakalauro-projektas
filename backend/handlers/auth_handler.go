package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type Handler struct {
	DB *pgxpool.Pool
}

type RegisterRequest struct {
	Vardas      string `json:"vardas"`
	Pavarde     string `json:"pavarde"`
	El_pastas   string `json:"el_pastas"`
	Slaptazodis string `json:"slaptazodis"`
	Role        string `json:"role"`
}

type LoginRequest struct {
	El_pastas   string `json:"el_pastas"`
	Slaptazodis string `json:"slaptazodis"`
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Metodas neleidžiamas", http.StatusMethodNotAllowed)
		return
	}

	var request RegisterRequest

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Neteisingas JSON formatas", http.StatusBadRequest)
		return
	}

	if request.Vardas == "" || request.Pavarde == "" || request.El_pastas == "" || request.Slaptazodis == "" {
		http.Error(w, "Įveskite visus duomenis", http.StatusBadRequest)
		return
	}

	if len(request.Slaptazodis) < 8 {
		http.Error(w, "Slaptažodį turi sudaryti bent 8 simboliai", http.StatusBadRequest)
		return
	}

	hashedSlaptazodis, err := bcrypt.GenerateFromPassword(
		[]byte(request.Slaptazodis),
		bcrypt.DefaultCost,
	)

	if err != nil {
		http.Error(w, "Nepavyko apdoroti slaptažodžio", http.StatusBadRequest)
		return
	}

	var naudotojoID int

	err = h.DB.QueryRow(
		r.Context(),
		`INSERT INTO naudotojas
		(vardas, pavarde, el_pastas, slaptazodis, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id`,
		request.Vardas,
		request.Pavarde,
		request.El_pastas,
		string(hashedSlaptazodis),
		request.Role,
	).Scan(&naudotojoID)

	if err != nil {
		log.Println("REGISTRACIJOS KLAIDA:", err)
		http.Error(w, "Registracija nepavyko", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Registracija sėkminga",
		"user_id": naudotojoID,
	})
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var loginRequest LoginRequest

	err := json.NewDecoder(r.Body).Decode(&loginRequest)
	if err != nil {
		http.Error(w, "Neteisingas JSON formatas", http.StatusBadRequest)
		return
	}

	if loginRequest.El_pastas == "" || loginRequest.Slaptazodis == "" {
		http.Error(w, "Įrašykite visus duomenis", http.StatusBadRequest)
		return
	}

	var (
		naudotojoID int
		slaptazodis string
		role        string
	)

	err = h.DB.QueryRow(
		r.Context(),
		`SELECT id, slaptazodis, role
         FROM naudotojas
         WHERE el_pastas = $1`,
		loginRequest.El_pastas,
	).Scan(&naudotojoID, &slaptazodis, &role)

	if err != nil {
		http.Error(w, "Neteisingas el. paštas arba slaptažodis", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(slaptazodis),
		[]byte(loginRequest.Slaptazodis),
	)

	if err != nil {
		http.Error(w, "Neteisingas el. paštas arba slaptažodis", http.StatusUnauthorized)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": naudotojoID,
		"role":    role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})

	secret := []byte(os.Getenv("JWT_SECRET"))

	tokenString, err := token.SignedString(secret)
	if err != nil {
		http.Error(w, "Nepavyko sukurti prisijungimo rakto", http.StatusUnauthorized)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    tokenString,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   86400,
	})

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Prisijungimas sėkmingas",
		"user_id": naudotojoID,
		"role":    role,
	})
}
