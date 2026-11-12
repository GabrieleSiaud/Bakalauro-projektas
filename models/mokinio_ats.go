package models

import "math/big"

type Mokinio_ats struct {
	ID          big.Int `json:"id"`
	Bandymo_id  big.Int `json:"bandymo_id"`
	Klausimo_id big.Int `json:"klausimo_id"`
	Variantas   string  `json:"variantas"`
}
