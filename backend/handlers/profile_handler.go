package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Netinkamas užklausos metodas", http.StatusMethodNotAllowed)
		return
	}

	// Gauname prisijungimo slapuką
	cookie, err := r.Cookie("auth_token")
	if err != nil {
		fmt.Println("Me: slapuko klaida:", err)
		http.Error(w, "Naudotojas neprisijungęs", http.StatusUnauthorized)
		return
	}

	// Tikriname JWT tokeną
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		fmt.Println("Me: KLAIDA – JWT_SECRET nenustatytas")
		http.Error(w, "Serverio klaida", http.StatusInternalServerError)
		return
	}

	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("netinkamas tokeno pasirašymo metodas")
		}

		return []byte(secret), nil
	})

	if err != nil || !token.Valid {
		fmt.Println("Me: JWT klaida:", err)
		http.Error(w, "Negaliojantis prisijungimas", http.StatusUnauthorized)
		return
	}

	// Gauname naudotojo ID iš tokeno
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Netinkami tokeno duomenys", http.StatusUnauthorized)
		return
	}

	naudotojoID, ok := claims["naudotojo_id"].(float64)
	if !ok {
		fmt.Println("Me: tokene nėra naudotojo_id, claims:", claims)
		http.Error(w, "Nerastas naudotojo ID", http.StatusUnauthorized)
		return
	}

	// Gauname naudotojo informaciją iš DB
	var naudotojas struct {
		ID       int    `json:"id"`
		Vardas   string `json:"vardas"`
		Pavarde  string `json:"pavarde"`
		ElPastas string `json:"el_pastas"`
		Role     string `json:"role"`
	}

	err = h.DB.QueryRow(r.Context(),
		`SELECT id, vardas, pavarde, el_pastas, role
		 FROM naudotojas
		 WHERE id = $1`,
		int(naudotojoID),
	).Scan(
		&naudotojas.ID,
		&naudotojas.Vardas,
		&naudotojas.Pavarde,
		&naudotojas.ElPastas,
		&naudotojas.Role,
	)

	if err != nil {
		fmt.Println("SQL klaida:", err)
		http.Error(w, "Nepavyko rasti naudotojo", http.StatusNotFound)
		return
	}

	// Grąžiname duomenis React programai
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(naudotojas)
}
