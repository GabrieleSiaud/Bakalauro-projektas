package handlers

import (
	"archive/zip"
	"encoding/json"
	"encoding/xml"
	"errors"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/ledongthuc/pdf"
)

// JSON klaidų grąžinimas frontend puslapiui
func theoryError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	json.NewEncoder(w).Encode(map[string]string{
		"message": message,
	})
}

// Mokytojo ID gavimas iš JWT slapuko
func (h *Handler) getTeacherID(r *http.Request) (int, error) {
	cookie, err := r.Cookie("auth_token")
	if err != nil {
		return 0, errors.New("nerastas prisijungimo slapukas")
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return 0, errors.New("nenustatytas JWT_SECRET")
	}

	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("neteisingas tokeno metodas")
		}

		return []byte(secret), nil
	})

	if err != nil || token == nil || !token.Valid {
		return 0, errors.New("neteisingas tokenas")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("neteisingi tokeno duomenys")
	}

	id, ok := claims["naudotojo_id"].(float64)
	if !ok {
		return 0, errors.New("nerastas naudotojo ID")
	}

	if id <= 0 {
		return 0, errors.New("neteisingas naudotojo ID")
	}

	return int(id), nil
}

// Teksto ištraukimas iš TXT, PDF ir DOCX failų
func extractTheoryText(fileHeader *multipart.FileHeader) (string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	extension := strings.ToLower(filepath.Ext(fileHeader.Filename))

	switch extension {

	case ".txt":
		data, err := io.ReadAll(file)
		if err != nil {
			return "", err
		}

		return string(data), nil

	case ".pdf":
		tempFile, err := os.CreateTemp("", "*.pdf")
		if err != nil {
			return "", err
		}
		defer os.Remove(tempFile.Name())

		_, err = io.Copy(tempFile, file)
		if err != nil {
			tempFile.Close()
			return "", err
		}

		if err := tempFile.Close(); err != nil {
			return "", err
		}

		pdfFile, reader, err := pdf.Open(tempFile.Name())
		if err != nil {
			return "", err
		}
		defer pdfFile.Close()

		textReader, err := reader.GetPlainText()
		if err != nil {
			return "", err
		}

		data, err := io.ReadAll(textReader)
		if err != nil {
			return "", err
		}

		return string(data), nil

	case ".docx":
		tempFile, err := os.CreateTemp("", "*.docx")
		if err != nil {
			return "", err
		}
		defer os.Remove(tempFile.Name())

		_, err = io.Copy(tempFile, file)
		if err != nil {
			tempFile.Close()
			return "", err
		}

		if err := tempFile.Close(); err != nil {
			return "", err
		}

		reader, err := zip.OpenReader(tempFile.Name())
		if err != nil {
			return "", err
		}
		defer reader.Close()

		for _, f := range reader.File {
			if f.Name == "word/document.xml" {
				doc, err := f.Open()
				if err != nil {
					return "", err
				}

				decoder := xml.NewDecoder(doc)
				var result strings.Builder

				for {
					token, err := decoder.Token()

					if err == io.EOF {
						break
					}

					if err != nil {
						doc.Close()
						return "", err
					}

					if charData, ok := token.(xml.CharData); ok {
						result.Write([]byte(charData))
					}
				}

				doc.Close()

				return result.String(), nil
			}
		}

		return "", errors.New("DOCX dokumente nerastas tekstas")

	default:
		return "", errors.New("nepalaikomas failo formatas")
	}
}

// Teorinės medžiagos sukūrimas
func (h *Handler) CreateTheory(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		theoryError(w, http.StatusMethodNotAllowed, "Leidžiamas tik POST metodas")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 10<<20)

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		theoryError(w, http.StatusBadRequest, "Nepavyko nuskaityti duomenų arba failas per didelis")
		return
	}

	if r.MultipartForm != nil {
		defer r.MultipartForm.RemoveAll()
	}

	teacherID, err := h.getTeacherID(r)
	if err != nil {
		log.Println("MOKYTOJO ID KLAIDA:", err)
		theoryError(w, http.StatusUnauthorized, "Neprisijungęs naudotojas")
		return
	}

	var role string

	err = h.DB.QueryRow(
		r.Context(),
		"SELECT role FROM naudotojas WHERE id=$1",
		teacherID,
	).Scan(&role)

	if err != nil {
		log.Println("ROLĖS TIKRINIMO KLAIDA:", err)
		theoryError(w, http.StatusInternalServerError, "Nepavyko patikrinti naudotojo")
		return
	}

	if role != "mokytojas" {
		theoryError(w, http.StatusForbidden, "Tik mokytojas gali kurti teoriją")
		return
	}

	dalykas := strings.TrimSpace(r.FormValue("dalykas"))
	pavadinimas := strings.TrimSpace(r.FormValue("pavadinimas"))
	turinys := strings.TrimSpace(r.FormValue("turinys"))
	mode := r.FormValue("mode")

	if dalykas == "" || pavadinimas == "" {
		theoryError(w, http.StatusBadRequest, "Užpildykite visus privalomus laukus")
		return
	}

	if mode == "upload" {
		_, header, err := r.FormFile("file")
		if err != nil {
			theoryError(w, http.StatusBadRequest, "Nepavyko gauti failo")
			return
		}

		turinys, err = extractTheoryText(header)
		if err != nil {
			log.Println("FAILO NUSKAITYMO KLAIDA:", err)
			theoryError(w, http.StatusBadRequest, "Nepavyko ištraukti teksto iš failo: "+err.Error())
			return
		}

		turinys = strings.TrimSpace(turinys)
	}

	if mode != "write" && mode != "upload" {
		theoryError(w, http.StatusBadRequest, "Neteisingas teorijos pateikimo būdas")
		return
	}

	if turinys == "" {
		theoryError(w, http.StatusBadRequest, "Teorijos turinys negali būti tuščias")
		return
	}

	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		log.Println("TRANSAKCIJOS PRADŽIOS KLAIDA:", err)
		theoryError(w, http.StatusInternalServerError, "Nepavyko pradėti išsaugojimo")
		return
	}

	defer tx.Rollback(r.Context())

	var pamokosID int64

	err = tx.QueryRow(
		r.Context(),
		`INSERT INTO pamoka (dalykas, pavadinimas, naudotojo_id)
		 VALUES ($1, $2, $3)
		 RETURNING id`,
		dalykas,
		pavadinimas,
		teacherID,
	).Scan(&pamokosID)

	if err != nil {
		log.Println("PAMOKOS SUKŪRIMO KLAIDA:", err)
		theoryError(w, http.StatusInternalServerError, "Nepavyko sukurti pamokos")
		return
	}

	var teorijosID int64

	err = tx.QueryRow(
		r.Context(),
		`INSERT INTO teorija (pavadinimas, turinys, pamokos_id)
		 VALUES ($1, $2, $3)
		 RETURNING id`,
		pavadinimas,
		turinys,
		pamokosID,
	).Scan(&teorijosID)

	if err != nil {
		log.Println("TEORIJOS IŠSAUGOJIMO KLAIDA:", err)
		theoryError(w, http.StatusInternalServerError, "Nepavyko išsaugoti teorijos")
		return
	}

	err = tx.Commit(r.Context())

	if err != nil {
		log.Println("COMMIT KLAIDA:", err)
		theoryError(w, http.StatusInternalServerError, "Nepavyko galutinai išsaugoti duomenų")
		return
	}

	log.Println("TEORIJA SĖKMINGAI IŠSAUGOTA")
	log.Println("Pamokos ID:", pamokosID)
	log.Println("Teorijos ID:", teorijosID)
	log.Println("Mokytojo ID:", teacherID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":     "Teorija sėkmingai išsaugota",
		"pamokos_id":  pamokosID,
		"teorijos_id": teorijosID,
	})
}
