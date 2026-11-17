package models

import (
	"math/big"
	"time"
)

type Testas struct {
	ID          big.Int   `json:"id"`
	Pavadinimas string    `json:"pavadinimas"`
	Aprasymas   string    `json:"aprasymas"`
	Sukurtas    time.Time `json:"sukurtas"`
	Pamokos_id  big.Int   `json:"pamokos_id"`
}
