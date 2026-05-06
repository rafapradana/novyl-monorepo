package utils

import "golang.org/x/crypto/bcrypt"

const bcryptCost = 12

// HashPassword menghasilkan bcrypt hash dari password plaintext.
// Cost factor 12 = balance antara security dan performance.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	return string(bytes), err
}

// CheckPassword memverifikasi password plaintext terhadap hash bcrypt.
// Return true jika cocok, false jika tidak.
func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
