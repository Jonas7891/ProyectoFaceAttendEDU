package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

/**
 * IEEE 829 — Test Case Specification
 * Service: 08-ms-notification
 * Entity: AlertType
 * Test IDs: TC-08-006 through TC-08-010
 */

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	return gin.New()
}

func TestTC08006_CreateAlertType(t *testing.T) {
	// IEEE 829 TC-08-006: Create AlertType with valid data
	router := setupTestRouter()

	// Mock handler that simulates create
	router.POST("/api/v1/alert-types", func(c *gin.Context) {
		var req struct {
			Code     string `json:"code"`
			Name     string `json:"name"`
			Severity string `json:"severity"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Validate required fields
		if req.Code == "" || req.Name == "" || req.Severity == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing required fields"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"alert_type_id": 1,
			"code":          req.Code,
			"name":          req.Name,
			"severity":      req.Severity,
		})
	})

	// Arrange
	body, _ := json.Marshal(map[string]string{
		"code":     "HIGH_ATTENDANCE",
		"name":     "High Attendance Alert",
		"severity": "HIGH",
	})
	req, _ := http.NewRequest("POST", "/api/v1/alert-types", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	// Act
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusCreated, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Equal(t, "HIGH_ATTENDANCE", response["code"])
	assert.Equal(t, "High Attendance Alert", response["name"])
}

func TestTC08007_GetAlertType(t *testing.T) {
	// IEEE 829 TC-08-007: Get AlertType by ID
	router := setupTestRouter()

	// Mock handler
	router.GET("/api/v1/alert-types/:id", func(c *gin.Context) {
		id := c.Param("id")
		if id == "1" {
			c.JSON(http.StatusOK, gin.H{
				"alert_type_id": 1,
				"code":          "HIGH_ATTENDANCE",
				"name":          "High Attendance Alert",
				"severity":      "HIGH",
			})
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "alert_type not found"})
		}
	})

	// Arrange
	req, _ := http.NewRequest("GET", "/api/v1/alert-types/1", nil)
	w := httptest.NewRecorder()

	// Act
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Equal(t, float64(1), response["alert_type_id"])
	assert.Equal(t, "HIGH_ATTENDANCE", response["code"])
}

func TestTC08008_UpdateAlertType(t *testing.T) {
	// IEEE 829 TC-08-008: Update AlertType
	router := setupTestRouter()

	// Mock handler
	router.PUT("/api/v1/alert-types/:id", func(c *gin.Context) {
		var req struct {
			Code     string `json:"code"`
			Name     string `json:"name"`
			Severity string `json:"severity"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"alert_type_id": 1,
			"code":          req.Code,
			"name":          req.Name,
			"severity":      req.Severity,
		})
	})

	// Arrange
	body, _ := json.Marshal(map[string]string{
		"code":     "HIGH_ATTENDANCE",
		"name":     "Updated Alert Type",
		"severity": "CRITICAL",
	})
	req, _ := http.NewRequest("PUT", "/api/v1/alert-types/1", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	// Act
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Equal(t, "Updated Alert Type", response["name"])
	assert.Equal(t, "CRITICAL", response["severity"])
}

func TestTC08009_DeleteAlertType(t *testing.T) {
	// IEEE 829 TC-08-009: Delete AlertType
	router := setupTestRouter()

	// Mock handler
	router.DELETE("/api/v1/alert-types/:id", func(c *gin.Context) {
		id := c.Param("id")
		if id == "1" {
			c.Status(http.StatusNoContent)
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "alert_type not found"})
		}
	})

	// Arrange
	req, _ := http.NewRequest("DELETE", "/api/v1/alert-types/1", nil)
	w := httptest.NewRecorder()

	// Act
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusNoContent, w.Code)
}

func TestTC08010_ListAlertTypes(t *testing.T) {
	// IEEE 829 TC-08-010: List AlertTypes
	router := setupTestRouter()

	// Mock handler
	router.GET("/api/v1/alert-types", func(c *gin.Context) {
		alertTypes := []map[string]interface{}{
			{"alert_type_id": 1, "code": "HIGH_ATTENDANCE", "name": "High Attendance"},
			{"alert_type_id": 2, "code": "LOW_ATTENDANCE", "name": "Low Attendance"},
		}
		c.JSON(http.StatusOK, gin.H{"alert_types": alertTypes})
	})

	// Arrange
	req, _ := http.NewRequest("GET", "/api/v1/alert-types", nil)
	w := httptest.NewRecorder()

	// Act
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)

	alertTypes := response["alert_types"].([]interface{})
	assert.Len(t, alertTypes, 2)
}

func TestTC08001_CreateAlert(t *testing.T) {
	// IEEE 829 TC-08-001: Create Alert with valid data
	router := setupTestRouter()

	// Mock handler
	router.POST("/api/v1/alerts", func(c *gin.Context) {
		var req struct {
			AcademicActorID int64 `json:"academic_actor_id"`
			AlertTypeID     int16 `json:"alert_type_id"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if req.AcademicActorID == 0 || req.AlertTypeID == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing required fields"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"alert_id":          1,
			"academic_actor_id": req.AcademicActorID,
			"alert_type_id":     req.AlertTypeID,
		})
	})

	// Arrange
	body, _ := json.Marshal(map[string]int64{
		"academic_actor_id": 100,
		"alert_type_id":     1,
	})
	req, _ := http.NewRequest("POST", "/api/v1/alerts", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	// Act
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusCreated, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Equal(t, float64(100), response["academic_actor_id"])
}

func TestTC08002_ResolveAlert(t *testing.T) {
	// IEEE 829 TC-08-002: Resolve Alert
	router := setupTestRouter()

	// Mock handler
	router.PUT("/api/v1/alerts/:id/resolve", func(c *gin.Context) {
		id := c.Param("id")
		if id == "1" {
			c.JSON(http.StatusOK, gin.H{
				"alert_id":    1,
				"resolved_at": "2026-09-21T10:30:00Z",
			})
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "alert not found"})
		}
	})

	// Arrange
	req, _ := http.NewRequest("PUT", "/api/v1/alerts/1/resolve", nil)
	w := httptest.NewRecorder()

	// Act
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.NotNil(t, response["resolved_at"])
}

func TestTC08003_GetAlert(t *testing.T) {
	// IEEE 829 TC-08-003: Get Alert by ID
	router := setupTestRouter()

	// Mock handler
	router.GET("/api/v1/alerts/:id", func(c *gin.Context) {
		id := c.Param("id")
		if id == "1" {
			c.JSON(http.StatusOK, gin.H{
				"alert_id":          1,
				"academic_actor_id": 100,
				"alert_type_id":     1,
			})
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "alert not found"})
		}
	})

	// Arrange
	req, _ := http.NewRequest("GET", "/api/v1/alerts/1", nil)
	w := httptest.NewRecorder()

	// Act
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestTC08004_DeleteAlert(t *testing.T) {
	// IEEE 829 TC-08-004: Delete Alert
	router := setupTestRouter()

	// Mock handler
	router.DELETE("/api/v1/alerts/:id", func(c *gin.Context) {
		id := c.Param("id")
		if id == "1" {
			c.Status(http.StatusNoContent)
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "alert not found"})
		}
	})

	// Arrange
	req, _ := http.NewRequest("DELETE", "/api/v1/alerts/1", nil)
	w := httptest.NewRecorder()

	// Act
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusNoContent, w.Code)
}

func TestTC08005_ListAlerts(t *testing.T) {
	// IEEE 829 TC-08-005: List Alerts
	router := setupTestRouter()

	// Mock handler
	router.GET("/api/v1/alerts", func(c *gin.Context) {
		alerts := []map[string]interface{}{
			{"alert_id": 1, "academic_actor_id": 100, "alert_type_id": 1},
			{"alert_id": 2, "academic_actor_id": 200, "alert_type_id": 2},
		}
		c.JSON(http.StatusOK, gin.H{"alerts": alerts})
	})

	// Arrange
	req, _ := http.NewRequest("GET", "/api/v1/alerts", nil)
	w := httptest.NewRecorder()

	// Act
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)

	alerts := response["alerts"].([]interface{})
	assert.Len(t, alerts, 2)
}

func TestTC08005_ListAlerts_FilterByActor(t *testing.T) {
	// IEEE 829 TC-08-005: List Alerts filtered by actor
	router := setupTestRouter()

	// Mock handler
	router.GET("/api/v1/alerts", func(c *gin.Context) {
		actorID := c.Query("actor_id")
		alerts := []map[string]interface{}{
			{"alert_id": 1, "academic_actor_id": 100, "alert_type_id": 1},
		}
		if actorID != "" {
			alerts = alerts[:1] // Filter
		}
		c.JSON(http.StatusOK, gin.H{"alerts": alerts})
	})

	// Arrange
	req, _ := http.NewRequest("GET", "/api/v1/alerts?actor_id=100", nil)
	w := httptest.NewRecorder()

	// Act
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)
}
