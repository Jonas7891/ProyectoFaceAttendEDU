package handler

import (
	"context"
	"errors"
	"log"
	"net/http"
	"net/mail"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/faceattend/notification-service/internal/infrastructure/email"
)

/**
 * Email channel (SERVICE.md §8).
 *
 * Internal endpoint: 01-ms-identity posts here after generating a recovery
 * code, and this service owns the SMTP transport plus the templates. The
 * payload is deliberately narrow (template + data, no free-form subject/body)
 * so the route cannot be used as an open relay. Kong does not expose
 * /api/v1/emails; it is reachable only inside the compose app network.
 */
type SendEmailRequest struct {
	To       string            `json:"to" binding:"required"`
	Template string            `json:"template" binding:"required"`
	Data     map[string]string `json:"data"`
}

type EmailHandler struct {
	sender email.Sender
	cfg    email.Config
}

func NewEmailHandler(sender email.Sender, cfg email.Config) *EmailHandler {
	return &EmailHandler{sender: sender, cfg: cfg}
}

func (h *EmailHandler) Register(r gin.IRouter) {
	r.POST("/api/v1/emails", h.Send)
}

func (h *EmailHandler) Send(c *gin.Context) {
	if !h.authorized(c) {
		c.JSON(http.StatusForbidden, gin.H{"error": "FORBIDDEN", "message": "missing or invalid internal token"})
		return
	}

	var req SendEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "VALIDATION_ERROR", "message": err.Error()})
		return
	}
	req.To = strings.TrimSpace(req.To)
	if _, err := mail.ParseAddress(req.To); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "VALIDATION_ERROR", "message": "to must be a valid email address"})
		return
	}
	req.Template = strings.TrimSpace(req.Template)
	if req.Template != email.TemplateVerificationCode {
		c.JSON(http.StatusBadRequest, gin.H{"error": "VALIDATION_ERROR", "message": "unsupported template"})
		return
	}

	text, htmlBody, err := email.Render(req.Template, req.Data)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "VALIDATION_ERROR", "message": err.Error()})
		return
	}

	ctx, cancel := h.withTimeout(c)
	defer cancel()

	msg := email.Message{
		To:       req.To,
		Subject:  email.Subject(req.Template),
		TextBody: text,
		HTMLBody: htmlBody,
	}
	if err := h.sender.Send(ctx, msg); err != nil {
		if errors.Is(err, email.ErrNotConfigured) {
			// Dev without SMTP: keep the flow alive and make the gap obvious in logs.
			log.Printf("WARN: email skipped, SMTP_HOST is empty (to=%s template=%s)", req.To, req.Template)
			c.JSON(http.StatusAccepted, gin.H{"status": "skipped", "reason": "smtp_not_configured"})
			return
		}
		log.Printf("ERROR: email delivery failed to=%s template=%s err=%v", req.To, req.Template, err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "DELIVERY_FAILED", "message": "email delivery failed"})
		return
	}
	log.Printf("INFO: email delivered to=%s template=%s", req.To, req.Template)
	c.JSON(http.StatusAccepted, gin.H{"status": "accepted"})
}

// authorized enforces the optional shared secret (EMAIL_INTERNAL_TOKEN). When
// the variable is unset the endpoint stays open inside the compose network,
// which is the same posture the rest of this service has.
func (h *EmailHandler) authorized(c *gin.Context) bool {
	if h.cfg.InternalToken == "" {
		return true
	}
	return h.cfg.InternalToken == c.GetHeader("X-Internal-Token")
}

func (h *EmailHandler) withTimeout(c *gin.Context) (context.Context, context.CancelFunc) {
	timeout := h.cfg.Timeout
	if timeout <= 0 {
		timeout = 10 * time.Second
	}
	return context.WithTimeout(c.Request.Context(), timeout)
}
