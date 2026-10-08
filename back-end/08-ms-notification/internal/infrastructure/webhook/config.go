package webhook

import (
	"os"
	"strconv"
	"strings"
	"time"
)

// Config holds the outbound webhook settings used to notify an external
// system when an alert is raised. alert_type.channel (EMAIL/PUSH) was
// persisted but never consulted anywhere: this is the delivery mechanism
// that was missing.
//
// Disabled (no outbound call) when WEBHOOK_URL is empty, same pattern as
// the SMTP sender in internal/infrastructure/email: the API keeps working
// in dev without the env var set.
type Config struct {
	URL     string
	Secret  string // optional HMAC-SHA256 signing key, sent as X-Webhook-Signature
	Timeout time.Duration
}

// Enabled reports whether an outbound webhook URL is configured.
func (c Config) Enabled() bool { return c.URL != "" }

// FromEnv builds the Config from WEBHOOK_* environment variables.
func FromEnv() Config {
	return Config{
		URL:     strings.TrimSpace(os.Getenv("WEBHOOK_URL")),
		Secret:  os.Getenv("WEBHOOK_SECRET"),
		Timeout: time.Duration(intEnv("WEBHOOK_TIMEOUT_SECONDS", 5)) * time.Second,
	}
}

func intEnv(name string, fallback int) int {
	v := strings.TrimSpace(os.Getenv(name))
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil || n <= 0 {
		return fallback
	}
	return n
}
