package webhook

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestNotifyIsNoopWithoutURL(t *testing.T) {
	n := NewHTTPNotifier(Config{Timeout: time.Second})
	err := n.Notify(context.Background(), Payload{AlertID: 1})
	if err != ErrNotConfigured {
		t.Fatalf("expected ErrNotConfigured, got %v", err)
	}
}

func TestNotifyPostsJSONPayload(t *testing.T) {
	var gotBody []byte
	var gotContentType string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotContentType = r.Header.Get("Content-Type")
		gotBody, _ = io.ReadAll(r.Body)
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	n := NewHTTPNotifier(Config{URL: server.URL, Timeout: time.Second})
	payload := Payload{AlertID: 42, AcademicActorID: 7, AlertTypeCode: "ATTENDANCE_ABSENTEEISM", Channel: "EMAIL"}
	if err := n.Notify(context.Background(), payload); err != nil {
		t.Fatalf("Notify failed: %v", err)
	}

	if gotContentType != "application/json" {
		t.Errorf("Content-Type = %q, want application/json", gotContentType)
	}
	var decoded Payload
	if err := json.Unmarshal(gotBody, &decoded); err != nil {
		t.Fatalf("response body is not valid JSON: %v", err)
	}
	if decoded != payload {
		t.Errorf("decoded payload = %+v, want %+v", decoded, payload)
	}
}

func TestNotifySignsBodyWhenSecretConfigured(t *testing.T) {
	var gotSignature string
	var gotBody []byte
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotSignature = r.Header.Get("X-Webhook-Signature")
		gotBody, _ = io.ReadAll(r.Body)
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	n := NewHTTPNotifier(Config{URL: server.URL, Secret: "s3cr3t", Timeout: time.Second})
	if err := n.Notify(context.Background(), Payload{AlertID: 1}); err != nil {
		t.Fatalf("Notify failed: %v", err)
	}

	mac := hmac.New(sha256.New, []byte("s3cr3t"))
	mac.Write(gotBody)
	want := hex.EncodeToString(mac.Sum(nil))
	if gotSignature != want {
		t.Errorf("X-Webhook-Signature = %q, want %q", gotSignature, want)
	}
}

func TestNotifyReturnsErrorOnNon2xx(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer server.Close()

	n := NewHTTPNotifier(Config{URL: server.URL, Timeout: time.Second})
	if err := n.Notify(context.Background(), Payload{AlertID: 1}); err == nil {
		t.Fatal("expected an error for a 500 response, got nil")
	}
}
