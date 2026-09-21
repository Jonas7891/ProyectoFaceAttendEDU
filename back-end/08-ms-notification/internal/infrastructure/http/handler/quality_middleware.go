package handler

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

/**
 * ISO/IEC 9001 — Quality Audit Middleware for Gin (Cláusula 8.5.2 / 9.1)
 *
 * Registra cada operación CRUD con metadata completa para trazabilidad.
 * Mismo patrón que los servicios Java y TypeScript para consistencia ISO.
 */

// ── Quality Metrics Store ──────────────────────────────────────

type QualityMetrics struct {
	mu              sync.RWMutex
	TotalOperations int64
	SuccessCount    int64
	ErrorCount      int64
	ClientErrors    int64 // 4xx
	ServerErrors    int64 // 5xx
	CreateCount     int64 // POST
	ReadCount       int64 // GET
	UpdateCount     int64 // PUT/PATCH
	DeleteCount     int64 // DELETE
	TotalDurationMs int64
}

var qualityMetrics = &QualityMetrics{}

func (m *QualityMetrics) RecordOperation(operation string, status int, durationMs int64) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.TotalOperations++
	m.TotalDurationMs += durationMs

	if status >= 400 {
		m.ErrorCount++
		if status >= 500 {
			m.ServerErrors++
		} else {
			m.ClientErrors++
		}
	} else {
		m.SuccessCount++
	}

	switch operation {
	case "CREATE":
		m.CreateCount++
	case "READ":
		m.ReadCount++
	case "UPDATE":
		m.UpdateCount++
	case "DELETE":
		m.DeleteCount++
	}
}

func (m *QualityMetrics) Snapshot() QualityMetricsSnapshot {
	m.mu.RLock()
	defer m.mu.RUnlock()

	return QualityMetricsSnapshot{
		TotalOperations: m.TotalOperations,
		SuccessCount:    m.SuccessCount,
		ErrorCount:      m.ErrorCount,
		ClientErrors:    m.ClientErrors,
		ServerErrors:    m.ServerErrors,
		CreateCount:     m.CreateCount,
		ReadCount:       m.ReadCount,
		UpdateCount:     m.UpdateCount,
		DeleteCount:     m.DeleteCount,
		TotalDurationMs: m.TotalDurationMs,
	}
}

type QualityMetricsSnapshot struct {
	TotalOperations int64   `json:"total_operations"`
	SuccessCount    int64   `json:"success_count"`
	ErrorCount      int64   `json:"error_count"`
	ClientErrors    int64   `json:"client_errors_4xx"`
	ServerErrors    int64   `json:"server_errors_5xx"`
	CreateCount     int64   `json:"creates"`
	ReadCount       int64   `json:"reads"`
	UpdateCount     int64   `json:"updates"`
	DeleteCount     int64   `json:"deletes"`
	TotalDurationMs int64   `json:"total_duration_ms"`
}

func (s QualityMetricsSnapshot) ErrorRate() float64 {
	if s.TotalOperations == 0 {
		return 0.0
	}
	return float64(s.ErrorCount) / float64(s.TotalOperations) * 100
}

func (s QualityMetricsSnapshot) AvgResponseTimeMs() float64 {
	if s.TotalOperations == 0 {
		return 0.0
	}
	return float64(s.TotalDurationMs) / float64(s.TotalOperations)
}

func (s QualityMetricsSnapshot) Availability() float64 {
	if s.TotalOperations == 0 {
		return 100.0
	}
	return float64(s.SuccessCount) / float64(s.TotalOperations) * 100
}

// ── ISO 9001 Classifications ──────────────────────────────────

func classifyOperation(method string, url string) string {
	if len(url) >= 6 && url[:6] == "/health" {
		return "HEALTH"
	}
	if len(url) >= 8 && url[:8] == "/quality" {
		return "METRICS"
	}
	switch method {
	case "POST":
		return "CREATE"
	case "GET":
		return "READ"
	case "PUT", "PATCH":
		return "UPDATE"
	case "DELETE":
		return "DELETE"
	default:
		return "OTHER"
	}
}

func classifyISOClause(status int) string {
	switch {
	case status == 400:
		return "8.2"
	case status == 401 || status == 403:
		return "8.5"
	case status == 404:
		return "8.5"
	case status == 409:
		return "8.5"
	case status >= 500:
		return "10.2"
	default:
		return "9.1"
	}
}

// ── Quality Middleware ─────────────────────────────────────────

func QualityAuditMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		correlationID := fmt.Sprintf("%d-%s", start.UnixNano(), c.ClientIP())
		operation := classifyOperation(c.Request.Method, c.Request.URL.Path)

		// Set quality context
		c.Set("quality.correlationId", correlationID)
		c.Set("quality.operation", operation)

		// Process request
		c.Next()

		// Calculate duration
		duration := time.Since(start).Milliseconds()
		status := c.Writer.Status()
		isError := status >= 400

		// Record metrics
		qualityMetrics.RecordOperation(operation, status, duration)

		// Structured audit log entry
		logEntry := fmt.Sprintf(
			`{"correlationId":"%s","timestamp":"%s","service":"08-ms-notification","method":"%s","path":"%s","status":%d,"duration":%d,"operation":"%s","error":%t,"isoClause":"%s"}`,
			correlationID,
			time.Now().UTC().Format(time.RFC3339),
			c.Request.Method,
			c.Request.URL.Path,
			status,
			duration,
			operation,
			isError,
			classifyISOClause(status),
		)

		if isError {
			log.Printf("QUALITY_AUDIT_ERROR %s", logEntry)
		} else {
			log.Printf("QUALITY_AUDIT %s", logEntry)
		}
	}
}

// ── Quality Health Endpoint ────────────────────────────────────

func QualityHealthHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		snapshot := qualityMetrics.Snapshot()
		errorRate := snapshot.ErrorRate()
		availability := snapshot.Availability()
		avgResponseTime := snapshot.AvgResponseTimeMs()

		availabilityStatus := "HEALTHY"
		if errorRate >= 1.0 {
			availabilityStatus = "DEGRADED"
		}

		c.JSON(http.StatusOK, gin.H{
			"service":         "08-ms-notification",
			"timestamp":       time.Now().UTC().Format(time.RFC3339),
			"iso_compliance":  "ISO/IEC 9001:2015",
			"kpis": gin.H{
				"total_operations":    snapshot.TotalOperations,
				"success_count":       snapshot.SuccessCount,
				"error_count":         snapshot.ErrorCount,
				"error_rate_pct":      fmt.Sprintf("%.2f%%", errorRate),
				"avg_response_time_ms": fmt.Sprintf("%.2f", avgResponseTime),
				"availability_status": availabilityStatus,
			},
			"crud_operations": gin.H{
				"creates": snapshot.CreateCount,
				"reads":   snapshot.ReadCount,
				"updates": snapshot.UpdateCount,
				"deletes": snapshot.DeleteCount,
			},
			"error_classification": gin.H{
				"client_errors_4xx": snapshot.ClientErrors,
				"server_errors_5xx": snapshot.ServerErrors,
				"total_errors":      snapshot.ErrorCount,
			},
			"iso_clauses_status": gin.H{
				"clause_4_4_context":    "ACTIVE",
				"clause_8_2_requirements": "ACTIVE",
				"clause_8_5_production": "ACTIVE",
				"clause_9_1_measurement": "ACTIVE",
				"clause_10_2_corrective": "ACTIVE",
				"clause_7_5_documentation": "ACTIVE",
			},
			"availability_pct":    fmt.Sprintf("%.2f%%", availability),
			"target_availability": "99.5%",
			"meets_target":        availability >= 99.5,
		})
	}
}
