package security

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"path/filepath"
)

const keyFileName = "master.key"

type Keyring struct {
	master [32]byte
}

func LoadKeyring(encoded, directory, environment string) (*Keyring, error) {
	if encoded != "" {
		key, err := decodeKey(encoded)
		if err != nil {
			return nil, fmt.Errorf("CZCMS_MASTER_KEY: %w", err)
		}
		return &Keyring{master: key}, nil
	}
	if environment == "production" {
		return nil, errors.New("production master key must be supplied by CZCMS_MASTER_KEY")
	}
	if err := os.MkdirAll(directory, 0o700); err != nil {
		return nil, fmt.Errorf("create secrets directory: %w", err)
	}
	path := filepath.Join(directory, keyFileName)
	if contents, err := os.ReadFile(path); err == nil {
		key, decodeErr := decodeKey(string(contents))
		if decodeErr != nil {
			return nil, fmt.Errorf("read development master key: %w", decodeErr)
		}
		return &Keyring{master: key}, nil
	} else if !errors.Is(err, os.ErrNotExist) {
		return nil, fmt.Errorf("read development master key: %w", err)
	}

	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return nil, fmt.Errorf("generate development master key: %w", err)
	}
	encodedKey := base64.RawStdEncoding.EncodeToString(raw)
	file, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
	if errors.Is(err, os.ErrExist) {
		return LoadKeyring("", directory, environment)
	}
	if err != nil {
		return nil, fmt.Errorf("create development master key: %w", err)
	}
	if _, err = file.WriteString(encodedKey); err != nil {
		file.Close()
		return nil, fmt.Errorf("write development master key: %w", err)
	}
	if err = file.Close(); err != nil {
		return nil, fmt.Errorf("close development master key: %w", err)
	}
	var key [32]byte
	copy(key[:], raw)
	return &Keyring{master: key}, nil
}

func decodeKey(encoded string) ([32]byte, error) {
	var result [32]byte
	raw, err := base64.RawStdEncoding.Strict().DecodeString(encoded)
	if err != nil {
		raw, err = base64.StdEncoding.Strict().DecodeString(encoded)
	}
	if err != nil || len(raw) != len(result) {
		return result, errors.New("must be a base64-encoded 32-byte key")
	}
	copy(result[:], raw)
	return result, nil
}

func (k *Keyring) Encrypt(purpose string, plaintext []byte) ([]byte, error) {
	aead, err := k.aead(purpose)
	if err != nil {
		return nil, err
	}
	nonce := make([]byte, aead.NonceSize())
	if _, err = rand.Read(nonce); err != nil {
		return nil, err
	}
	result := make([]byte, 1, 1+len(nonce)+len(plaintext)+aead.Overhead())
	result[0] = 1
	result = append(result, nonce...)
	return aead.Seal(result, nonce, plaintext, []byte(purpose)), nil
}

func (k *Keyring) Decrypt(purpose string, ciphertext []byte) ([]byte, error) {
	aead, err := k.aead(purpose)
	if err != nil {
		return nil, err
	}
	if len(ciphertext) < 1+aead.NonceSize()+aead.Overhead() || ciphertext[0] != 1 {
		return nil, errors.New("invalid encrypted value")
	}
	nonce := ciphertext[1 : 1+aead.NonceSize()]
	return aead.Open(nil, nonce, ciphertext[1+aead.NonceSize():], []byte(purpose))
}

func (k *Keyring) HMAC(purpose, value string) string {
	mac := hmac.New(sha256.New, k.Derive(purpose))
	_, _ = mac.Write([]byte(value))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func (k *Keyring) Derive(purpose string) []byte {
	mac := hmac.New(sha256.New, k.master[:])
	_, _ = mac.Write([]byte("czcms:" + purpose))
	return mac.Sum(nil)
}

func (k *Keyring) aead(purpose string) (cipher.AEAD, error) {
	block, err := aes.NewCipher(k.Derive(purpose))
	if err != nil {
		return nil, err
	}
	return cipher.NewGCM(block)
}
