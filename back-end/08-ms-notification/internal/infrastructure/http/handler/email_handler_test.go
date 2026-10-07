package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/faceattend/notification-service/internal/infrastructure/email"
)

/**
 * IEEE 829 — Test Case Specification
 * Service: 08-ms-notification
 * Entity: Email (canal SMTP)
 * Test IDs: TC-08-011 through TC-08-017
 */

// Simula un relay que rechaza el mensaje (credenciales o destinatario inválido).
var errFakeSmtp = errors.New("535 5.7.8 Authentication credentials invalid")

type fakeSender struct {
	err   error
	calls int
	last  email.Message
}

func (f *fakeSender) Send(_ context.Context, msg email.Message) error {
	f.calls++
	f.last = msg
	return f.err
}

func newEmailRouter(sender email.Sender, cfg email.Config) *gin.Engine {
	router := setupTestRouter()
	NewEmailHandler(sender, cfg).Register(router)
	return router
}

func postEmail(t *testing.T, router http.Handler, body map[string]interface{}, token string) *httptest.ResponseRecorder {
	t.Helper()
	raw, err := json.Marshal(body)
	require.NoError(t, err)

	req, err := http.NewRequest(http.MethodPost, "/api/v1/emails", bytes.NewBuffer(raw))
	require.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("X-Internal-Token", token)
	}
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	return w
}

func validVerificationEmail() map[string]interface{} {
	return map[string]interface{}{
		"to":       "carolina.mendoza@example.com",
		"template": "verification_code",
		"data":     map[string]string{"code": "482913", "minutes": "10"},
	}
}

func TestTC08011_SendVerificationCodeAccepted(t *testing.T) {
	sender := &fakeSender{}
	router := newEmailRouter(sender, email.Config{Host: "smtp.example.com", Port: 587})

	w := postEmail(t, router, validVerificationEmail(), "")

	assert.Equal(t, http.StatusAccepted, w.Code)

	var response map[string]interface{}
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &response))
	assert.Equal(t, "accepted", response["status"])

	require.Equal(t, 1, sender.calls)
	assert.Equal(t, "carolina.mendoza@example.com", sender.last.To)
	assert.Contains(t, sender.last.Subject, "FaceAttend EDU")
	assert.Contains(t, sender.last.TextBody, "482913")
	assert.Contains(t, sender.last.HTMLBody, "482913")
}

func TestTC08012_SendSkippedWhenSmtpIsNotConfigured(t *testing.T) {
	router := newEmailRouter(&fakeSender{err: email.ErrNotConfigured}, email.Config{})

	w := postEmail(t, router, validVerificationEmail(), "")

	assert.Equal(t, http.StatusAccepted, w.Code)

	var response map[string]interface{}
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &response))
	assert.Equal(t, "skipped", response["status"])
	assert.Equal(t, "smtp_not_configured", response["reason"])
}

func TestTC08013_SendFailsWhenRelayRejects(t *testing.T) {
	router := newEmailRouter(&fakeSender{err: errFakeSmtp}, email.Config{Host: "smtp.example.com"})

	w := postEmail(t, router, validVerificationEmail(), "")

	assert.Equal(t, http.StatusBadGateway, w.Code)

	var response map[string]interface{}
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &response))
	assert.Equal(t, "DELIVERY_FAILED", response["error"])
}

func TestTC08014_SendRejectsUnknownTemplate(t *testing.T) {
	router := newEmailRouter(&fakeSender{}, email.Config{Host: "smtp.example.com"})

	body := validVerificationEmail()
	body["template"] = "free_form"
	w := postEmail(t, router, body, "")

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestTC08015_SendRejectsInvalidRecipientAndMissingCode(t *testing.T) {
	router := newEmailRouter(&fakeSender{}, email.Config{Host: "smtp.example.com"})

	invalidTo := validVerificationEmail()
	invalidTo["to"] = "no-es-un-correo"
	assert.Equal(t, http.StatusBadRequest, postEmail(t, router, invalidTo, "").Code)

	missingCode := validVerificationEmail()
	missingCode["data"] = map[string]string{}
	assert.Equal(t, http.StatusBadRequest, postEmail(t, router, missingCode, "").Code)
}

func TestTC08016_SendRequiresInternalTokenWhenConfigured(t *testing.T) {
	sender := &fakeSender{}
	router := newEmailRouter(sender, email.Config{Host: "smtp.example.com", InternalToken: "s3cret"})

	assert.Equal(t, http.StatusForbidden, postEmail(t, router, validVerificationEmail(), "").Code)
	assert.Equal(t, http.StatusAccepted, postEmail(t, router, validVerificationEmail(), "s3cret").Code)
	assert.Equal(t, 1, sender.calls)
}

func TestTC08017_SendDoesNotLeakBodyOnDeliveryError(t *testing.T) {
	router := newEmailRouter(&fakeSender{err: errFakeSmtp}, email.Config{Host: "smtp.example.com"})

	w := postEmail(t, router, validVerificationEmail(), "")

	assert.NotContains(t, w.Body.String(), "482913")
	assert.NotContains(t, w.Body.String(), "535 ")
}
