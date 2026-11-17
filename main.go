package main

import (
	"fmt"
	"log"
	"net/http"
	"vbe-platform/backend/handlers"
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

	// API maršrutai
	http.HandleFunc("/api/register", h.Register)
	http.HandleFunc("/api/login", h.Login)

	log.Println("Serveris paleistas: http://localhost:8080")

	log.Fatal(http.ListenAndServe(":8080", nil))
}
