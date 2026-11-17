package models

import (
	"math/big"
	"time"
)

type Testu_band struct {
	ID              big.Int   `json:"id"`
	Testo_id        big.Int   `json:"testo_id"`
	Naudotojo_id    big.Int   `json:"naudotojo_id"`
	Surinkti_taskai int       `json:"surinkti_taskai"`
	Max_taskai      int       `json:"max_taskai"`
	Statusas        string    `json:"statusas"`
	Pradetas        time.Time `json:"pradetas"`
	Pabaiga         time.Time `json:"pabaiga"`
}
