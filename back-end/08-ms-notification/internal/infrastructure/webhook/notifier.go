package webhook

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
)

// ErrNotConfigured is returned when WEBHOOK_URL is empty: the caller must
// treat it as "skipped", not as a failure (dev environments run without one).
var ErrNotConfigured = errors.New("webhook not configured")

// Payload is the JSON body posted to WEBHOOK_URL when an alert fires.
type Payload struct {
	AlertID         int64  `json:"alert_id"`
	AcademicActorID int64  `json:"academic_actor_id"`
	AlertTypeID     int16  `json:"alert_type_id"`
	AlertTypeCode   string `json:"alert_type_code"`
	Severity        string `json:"severity"`
	Channel         string `json:"channel"`
	RaisedAt        string `json:"raised_at"`
}

// Notifier delivers one alert payload to an external system.
type Notifier interface {
	Notify(ctx context.Context, payload Payload) error
}

// HTTPNotifier POSTs the payload as JSON, optionally signed with an
// HMAC-SHA256 over the body (X-Webhook-Signature) when Config.Secret is set.
// Safe for concurrent use.
type HTTPNotifier struct {
	cfg    Config
	client *http.Client
}

// NewHTTPNotifier builds a notifier. cfg.Enabled() must be true to actually deliver.
func NewHTTPNotifier(cfg Config) *HTTPNotifier {
	return &HTTPNotifier{cfg: cfg, client: &http.Client{Timeout: cfg.Timeout}}
}

// Notify delivers payload. It enforces cfg.Timeout via the request context so
// a hung receiver can never block the caller.
func (n *HTTPNotifier) Notify(ctx context.Context, payload Payload) error {
	if !n.cfg.Enabled() {
		return ErrNotConfigured
	}
	if err := ctx.Err(); err != nil {
		return err
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("webhook: encode payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, n.cfg.URL, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("webhook: build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	if n.cfg.Secret != "" {
		req.Header.Set("X-Webhook-Signature", sign(n.cfg.Secret, body))
	}

	res, err := n.client.Do(req)
	if err != nil {
		return fmt.Errorf("webhook: deliver: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode >= 300 {
		return fmt.Errorf("webhook: receiver responded with status %d", res.StatusCode)
	}
	return nil
}

func sign(secret string, body []byte) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	return hex.EncodeToString(mac.Sum(nil))
}
