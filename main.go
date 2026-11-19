package main

import (
	"fmt"
	"log"
	"net/http"

	"vbe-platform/backend/handlers"
	"vbe-platform/backend/routes"
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

	defer conn.Close()

	fmt.Println("Sėkmingai prisijungta prie PostgreSQL!")

	h := &handlers.Handler{
		DB: conn,
	}

	router := routes.SetupRoutes(h)

	log.Println("Serveris paleistas: http://localhost:8080")

	err = http.ListenAndServe(":8080", EnableCORS(router))
	if err != nil {
		log.Fatal("Serverio paleidimo klaida:", err)
	}
}
