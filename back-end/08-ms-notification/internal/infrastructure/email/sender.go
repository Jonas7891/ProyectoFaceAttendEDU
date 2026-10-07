package email

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"net"
	"net/mail"
	"net/smtp"
	"net/textproto"
	"strconv"
	"strings"
	"time"
)

// ErrNotConfigured is returned when SMTP_HOST is empty: the caller must treat
// it as "skipped", not as a failure (dev environments run without a relay).
var ErrNotConfigured = errors.New("smtp not configured")

// Message is a rendered email ready to be handed to the transport.
type Message struct {
	To       string
	Subject  string
	TextBody string
	HTMLBody string
}

// Sender delivers one message. Implementations must be safe for concurrent use.
type Sender interface {
	Send(ctx context.Context, msg Message) error
}

// SMTPSender talks to an external relay over SMTP with optional STARTTLS
// (SERVICE.md §8: net/smtp, standard library only).
type SMTPSender struct {
	cfg Config
}

// NewSMTPSender builds a sender. cfg.Enabled() must be true to actually send.
func NewSMTPSender(cfg Config) *SMTPSender { return &SMTPSender{cfg: cfg} }

// Send delivers msg. It enforces cfg.Timeout on dial, greeting and I/O so a
// hung relay can never block the HTTP handler.
func (s *SMTPSender) Send(ctx context.Context, msg Message) error {
	if !s.cfg.Enabled() {
		return ErrNotConfigured
	}
	if err := ctx.Err(); err != nil {
		return err
	}

	from, err := mail.ParseAddress(s.cfg.From)
	if err != nil {
		return fmt.Errorf("invalid SMTP_FROM: %w", err)
	}
	to, err := mail.ParseAddress(msg.To)
	if err != nil {
		return fmt.Errorf("invalid recipient: %w", err)
	}

	conn, err := s.dial(ctx)
	if err != nil {
		return fmt.Errorf("smtp dial: %w", err)
	}
	defer conn.Close()

	if deadline, ok := ctx.Deadline(); ok {
		_ = conn.SetDeadline(deadline)
	} else {
		_ = conn.SetDeadline(time.Now().Add(s.cfg.Timeout))
	}

	client, err := smtp.NewClient(conn, s.cfg.Host)
	if err != nil {
		return fmt.Errorf("smtp hello: %w", err)
	}
	defer client.Close()

	if s.cfg.Port != 465 && s.cfg.StartTLS {
		if ok, _ := client.Extension("STARTTLS"); ok {
			if err := client.StartTLS(&tls.Config{ServerName: s.cfg.Host, MinVersion: tls.VersionTLS12}); err != nil {
				return fmt.Errorf("starttls: %w", err)
			}
		}
	}
	if s.cfg.Username != "" {
		// PlainAuth refuses cleartext credentials unless the connection is TLS.
		auth := smtp.PlainAuth("", s.cfg.Username, s.cfg.Password, s.cfg.Host)
		if err := client.Auth(auth); err != nil {
			return fmt.Errorf("smtp auth: %w", err)
		}
	}
	if err := client.Mail(from.Address); err != nil {
		return fmt.Errorf("smtp MAIL FROM: %w", err)
	}
	if err := client.Rcpt(to.Address); err != nil {
		return fmt.Errorf("smtp RCPT TO: %w", err)
	}

	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("smtp DATA: %w", err)
	}
	if _, err := io.WriteString(w, buildMIME(s.cfg.From, msg)); err != nil {
		_ = w.Close()
		return fmt.Errorf("smtp write: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("smtp close: %w", err)
	}
	return client.Quit()
}

func (s *SMTPSender) dial(ctx context.Context) (net.Conn, error) {
	addr := net.JoinHostPort(s.cfg.Host, strconv.Itoa(s.cfg.Port))
	dialer := &net.Dialer{Timeout: s.cfg.Timeout}
	if s.cfg.Port == 465 {
		return tls.DialWithDialer(dialer, "tcp", addr, &tls.Config{ServerName: s.cfg.Host, MinVersion: tls.VersionTLS12})
	}
	return dialer.DialContext(ctx, "tcp", addr)
}

// buildMIME assembles the wire format: multipart/alternative when an HTML
// body exists, plain text otherwise. Subjects with accents are RFC 2047 encoded.
func buildMIME(from string, msg Message) string {
	var b strings.Builder
	writeHeader := func(name, value string) {
		b.WriteString(name)
		b.WriteString(": ")
		b.WriteString(value)
		b.WriteString("\r\n")
	}

	writeHeader("From", from)
	writeHeader("To", msg.To)
	writeHeader("Subject", mime.QEncoding.Encode("utf-8", msg.Subject))
	writeHeader("Date", time.Now().Format(time.RFC1123Z))
	writeHeader("MIME-Version", "1.0")

	if msg.HTMLBody == "" {
		writeHeader("Content-Type", "text/plain; charset=UTF-8")
		b.WriteString("\r\n")
		b.WriteString(normalizeCRLF(msg.TextBody))
		return b.String()
	}

	multipartWriter := multipart.NewWriter(&b)
	writeHeader("Content-Type", fmt.Sprintf("multipart/alternative; boundary=%q", multipartWriter.Boundary()))
	b.WriteString("\r\n")

	writePart := func(contentType, body string) {
		header := make(textproto.MIMEHeader)
		header.Set("Content-Type", contentType+"; charset=UTF-8")
		if _, err := multipartWriter.CreatePart(header); err != nil {
			return
		}
		b.WriteString(normalizeCRLF(body))
	}
	writePart("text/plain", msg.TextBody)
	writePart("text/html", msg.HTMLBody)
	_ = multipartWriter.Close()
	return b.String()
}

func normalizeCRLF(s string) string {
	return strings.ReplaceAll(strings.ReplaceAll(s, "\r\n", "\n"), "\n", "\r\n")
}
