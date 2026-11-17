package models

import (
	"math/big"
	"time"
)

type Teorija struct {
	ID           big.Int   `json:"id"`
	Pavadinimas  string    `json:"pavadinimas"`
	Turinys      string    `json:"turinys"`
	Sukurta_data time.Time `json:"sukurta_data"`
	Pamokos_id   big.Int   `json:"pamokos_id"`
}
