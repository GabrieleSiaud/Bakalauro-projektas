package models

import "math/big"

type Klausimai struct {
	ID         big.Int `json:"id"`
	Testo_id   big.Int `json:"testo_id"`
	Klausimas  string  `json:"klausimas"`
	Avariantas string  `json:"avariantas"`
	Bvariantas string  `json:"bvariantas"`
	Cvariantas string  `json:"cvariantas"`
	Atsakymas  string  `json:"atsakymas"`
	Taskai     int     `json:"taskai"`
}
