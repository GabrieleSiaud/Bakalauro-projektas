package routes

import (
	"vbe-platform/backend/handlers"

	"github.com/go-chi/chi/v5"
)

func SetupRoutes(h *handlers.Handler) *chi.Mux {
	r := chi.NewRouter()

	r.Post("/api/register", h.Register)
	r.Post("/api/login", h.Login)
	r.Get("/api/me", h.Me)
	r.Post("/api/theoryCreate", h.CreateTheory)

	return r
}
