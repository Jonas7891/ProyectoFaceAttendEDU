package email

import (
	"os"
	"strconv"
	"strings"
	"time"
)

// Config holds the SMTP settings of the delivery channel. Everything is read
// from the environment so the binary needs no config file (SERVICE.md §9).
//
// The service is usable without SMTP: when SMTP_HOST is empty the sender is
// disabled and the API answers 202 "skipped" instead of failing, so the
// password-recovery flow of 01-ms-identity keeps working in dev.
type Config struct {
	Host          string
	Port          int
	Username      string
	Password      string
	From          string // RFC 5322, e.g. "FaceAttend EDU <no-reply@faceattend.local>"
	StartTLS      bool
	Timeout       time.Duration
	InternalToken string // optional shared secret for the internal /api/v1/emails endpoint
}

// Enabled reports whether an SMTP relay is configured.
func (c Config) Enabled() bool { return c.Host != "" }

// FromEnv builds the Config from SMTP_* / EMAIL_* environment variables.
func FromEnv() Config {
	return Config{
		Host:          strings.TrimSpace(os.Getenv("SMTP_HOST")),
		Port:          intEnv("SMTP_PORT", 587),
		Username:      os.Getenv("SMTP_USERNAME"),
		Password:      os.Getenv("SMTP_PASSWORD"),
		From:          strings.TrimSpace(defaultEnv("SMTP_FROM", "FaceAttend EDU <no-reply@faceattend.local>")),
		StartTLS:      boolEnv("SMTP_STARTTLS", true),
		Timeout:       time.Duration(intEnv("SMTP_TIMEOUT_SECONDS", 10)) * time.Second,
		InternalToken: os.Getenv("EMAIL_INTERNAL_TOKEN"),
	}
}

func defaultEnv(name, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(name)); v != "" {
		return v
	}
	return fallback
}

func intEnv(name string, fallback int) int {
	v := strings.TrimSpace(os.Getenv(name))
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil || n <= 0 || n > 65535 {
		return fallback
	}
	return n
}

func boolEnv(name string, fallback bool) bool {
	v := strings.ToLower(strings.TrimSpace(os.Getenv(name)))
	if v == "" {
		return fallback
	}
	return v == "true" || v == "1" || v == "yes" || v == "on"
}
