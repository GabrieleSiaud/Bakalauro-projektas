package models

import "math/big"

type Naudotojas struct {
	ID          big.Int `json:"id"`
	Vardas      string  `json:"vardas"`
	Pavarde     string  `json:"pavarde"`
	El_pastas   string  `json:"el_pastas"`
	Slaptazodis string  `json:"slaptazodis"`
	Role        string  `json:"role"`
}
