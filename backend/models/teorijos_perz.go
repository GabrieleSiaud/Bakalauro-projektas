package models

import (
	"math/big"
	"time"
)

type Teorijos_perz struct {
	ID             big.Int   `json:"id"`
	Teorijos_id    big.Int   `json:"teorijos_id"`
	Naudotojo_id   big.Int   `json:"naudotojo_id"`
	Perziura       bool      `json:"perziura"`
	Perziuros_data time.Time `json:"perziuros_data"`
}
