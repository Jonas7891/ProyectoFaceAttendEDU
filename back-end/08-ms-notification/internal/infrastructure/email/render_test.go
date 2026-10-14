package email

import (
	"strings"
	"testing"
)

func TestRenderVerificationCodeIncludesCodeAndTtl(t *testing.T) {
	text, html, err := Render(TemplateVerificationCode, map[string]string{
		"code":    "482913",
		"minutes": "10",
	})

	if err != nil {
		t.Fatalf("render failed: %v", err)
	}
	for _, body := range []string{html, text} {
		if !strings.Contains(body, "482913") {
			t.Errorf("body does not contain the code:\n%s", body)
		}
		if !strings.Contains(body, "10") {
			t.Errorf("body does not contain the ttl:\n%s", body)
		}
	}
	if !strings.Contains(html, "<html") {
		t.Errorf("html body is not html:\n%s", html)
	}
}

func TestRenderAcceptsLowercaseAndUppercaseKeys(t *testing.T) {
	lower, _, err := Render(TemplateVerificationCode, map[string]string{"code": "111111"})
	if err != nil {
		t.Fatalf("lowercase key rejected: %v", err)
	}
	upper, _, err := Render(TemplateVerificationCode, map[string]string{"Code": "222222"})
	if err != nil {
		t.Fatalf("uppercase key rejected: %v", err)
	}
	if !strings.Contains(lower, "111111") || !strings.Contains(upper, "222222") {
		t.Error("code was not rendered for one of the key styles")
	}
}

func TestRenderRequiresCode(t *testing.T) {
	if _, _, err := Render(TemplateVerificationCode, map[string]string{}); err == nil {
		t.Fatal("expected an error when data.code is missing")
	}
}

func TestRenderRejectsTemplateInjection(t *testing.T) {
	if _, _, err := Render(TemplateVerificationCode, map[string]string{"code": "{{.appname}}"}); err == nil {
		t.Fatal("expected an error when data contains template syntax")
	}
}

func TestSubjectIsFixedPerTemplate(t *testing.T) {
	if Subject(TemplateVerificationCode) == "" {
		t.Fatal("verification template must define a subject")
	}
	if Subject("unknown") == "" {
		t.Fatal("unknown template must still produce a subject")
	}
}
