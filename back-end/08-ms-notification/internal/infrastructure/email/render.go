package email

import (
	"embed"
	"fmt"
	"html/template"
	"strings"
	texttemplate "text/template"
)

//go:embed templates
var templateFS embed.FS

var (
	htmlTemplates = template.Must(template.ParseFS(templateFS, "templates/*.html.tmpl"))
	textTemplates = texttemplate.Must(texttemplate.ParseFS(templateFS, "templates/*.txt.tmpl"))
)

// Templates available to callers. Kept as a whitelist so /api/v1/emails can
// never be abused as an open relay that renders arbitrary content.
const TemplateVerificationCode = "verification_code"

// Subject returns the fixed subject line of a template. Callers cannot provide
// their own subject: that is what keeps this endpoint from being a relay.
func Subject(templateName string) string {
	if templateName == TemplateVerificationCode {
		return "Restablece tu contraseña - FaceAttend EDU"
	}
	return "FaceAttend EDU"
}

// Render produces the plain-text and HTML bodies of a template. Data keys are
// matched case-insensitively, so clients may send "code" or "Code".
func Render(templateName string, data map[string]string) (text string, htmlBody string, err error) {
	values := normalize(data)
	if strings.TrimSpace(values["code"]) == "" {
		return "", "", fmt.Errorf("data.code is required for template %q", templateName)
	}
	// Reject payloads that try to inject template syntax.
	for key, value := range values {
		if strings.ContainsAny(value, "{{}}") {
			return "", "", fmt.Errorf("data.%s contains unsupported characters", key)
		}
	}
	values["appname"] = fallback(values["appname"], "FaceAttend EDU")
	values["minutes"] = fallback(values["minutes"], "10")

	text, err = renderText(templateName, values)
	if err != nil {
		return "", "", err
	}
	htmlBody, err = renderHTML(templateName, values)
	if err != nil {
		return "", "", err
	}
	return text, htmlBody, nil
}

func renderText(templateName string, values map[string]string) (string, error) {
	t := textTemplates.Lookup(templateName + ".txt.tmpl")
	if t == nil {
		return "", fmt.Errorf("unknown template %q", templateName)
	}
	var b strings.Builder
	if err := t.Execute(&b, values); err != nil {
		return "", fmt.Errorf("render template %s.txt: %w", templateName, err)
	}
	return b.String(), nil
}

func renderHTML(templateName string, values map[string]string) (string, error) {
	t := htmlTemplates.Lookup(templateName + ".html.tmpl")
	if t == nil {
		return "", fmt.Errorf("unknown template %q", templateName)
	}
	var b strings.Builder
	if err := t.Execute(&b, values); err != nil {
		return "", fmt.Errorf("render template %s.html: %w", templateName, err)
	}
	return b.String(), nil
}

func normalize(data map[string]string) map[string]string {
	values := make(map[string]string, len(data))
	for key, value := range data {
		values[strings.ToLower(strings.TrimSpace(key))] = value
	}
	return values
}

func fallback(value, def string) string {
	if strings.TrimSpace(value) == "" {
		return def
	}
	return value
}
