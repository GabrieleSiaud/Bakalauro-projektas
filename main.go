package main

import (
	"context"
	"fmt"
	"log"
	"vbe-platform/db"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Nepavyko užkrauti .env failo")
	}

	conn, err := db.Connect()
	if err != nil {
		log.Fatal("Nepavyko prisijungti prie DB:", err)
	}

	defer conn.Close(context.Background())

	fmt.Println("Sėkmingai prisijungta prie PostgreSQL!")
}
