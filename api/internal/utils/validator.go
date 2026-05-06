package utils

import (
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
}

// ValidateStruct menjalankan validasi pada struct.
// Mengembalikan map[field]message untuk error yang mudah dibaca frontend.
func ValidateStruct(s interface{}) map[string]string {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}

	errors := make(map[string]string)
	for _, e := range err.(validator.ValidationErrors) {
		field := strings.ToLower(e.Field())
		switch e.Tag() {
		case "required":
			errors[field] = field + " wajib diisi"
		case "email":
			errors[field] = "format email tidak valid"
		case "min":
			errors[field] = field + " minimal " + e.Param() + " karakter"
		case "max":
			errors[field] = field + " maksimal " + e.Param() + " karakter"
		case "gte":
			errors[field] = field + " harus lebih besar atau sama dengan " + e.Param()
		case "lte":
			errors[field] = field + " harus lebih kecil atau sama dengan " + e.Param()
		default:
			errors[field] = field + " tidak valid"
		}
	}

	return errors
}

// ValidateEmail memvalidasi format email sederhana.
func ValidateEmail(email string) bool {
	return validate.Var(email, "required,email") == nil
}

// ValidateMinLength memvalidasi panjang minimum string.
func ValidateMinLength(s string, min int) bool {
	return validate.Var(s, "required,min="+string(rune(min+'0'))) == nil
}
