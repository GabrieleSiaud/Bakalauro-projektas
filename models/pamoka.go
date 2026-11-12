package models

import "math/big"

type Pamoka struct {
	ID           big.Int `json:"id"`
	Dalykas      string  `json:"dalykas"`
	Pavadinimas  string  `json:"pavadinimas"`
	Aprasymas    string  `json:"aprasymas"`
	Naudotojo_id big.Int `json:"naudotojo_id"`
}
