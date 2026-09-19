package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/faceattend/notification-service/internal/domain"
	"github.com/faceattend/notification-service/internal/domain/port"
)

type AlertHandler struct {
	creator  port.AlertCreator
	lister   port.AlertLister
	resolver port.AlertResolver
	deleter  port.AlertDeleter
}

func NewAlertHandler(creator port.AlertCreator, lister port.AlertLister, resolver port.AlertResolver, deleter port.AlertDeleter) *AlertHandler {
	return &AlertHandler{creator: creator, lister: lister, resolver: resolver, deleter: deleter}
}

func (h *AlertHandler) Register(r gin.IRouter) {
	g := r.Group("/api/v1/alerts")
	g.POST("", h.Create)
	g.GET("", h.List)
	g.GET("/:id", h.Get)
	g.PATCH("/:id/resolve", h.Resolve)
	g.DELETE("/:id", h.Delete)

	// alias without prefix for compatibility
	alt := r.Group("/alerts")
	alt.POST("", h.Create)
	alt.GET("", h.List)
	alt.GET("/:id", h.Get)
	alt.PATCH("/:id/resolve", h.Resolve)
	alt.DELETE("/:id", h.Delete)
}

func (h *AlertHandler) Create(c *gin.Context) {
	var req port.CreateAlertCommand
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id, err := h.creator.Create(c.Request.Context(), req)
	if err != nil {
		handleDomainError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"alert_id": id})
}

func (h *AlertHandler) List(c *gin.Context) {
	var q port.ListAlertsQuery
	if v := c.Query("actorId"); v != "" {
		if iv, err := strconv.ParseInt(v, 10, 64); err == nil {
			q.ActorID = &iv
		}
	}
	if v := c.Query("typeId"); v != "" {
		if iv, err := strconv.ParseInt(v, 10, 16); err == nil {
			sv := int16(iv)
			q.TypeID = &sv
		}
	}
	if v := c.Query("resolved"); v != "" {
		b, _ := strconv.ParseBool(v)
		q.Resolved = &b
	}
	if v := c.Query("limit"); v != "" {
		if iv, err := strconv.Atoi(v); err == nil {
			q.Limit = iv
		}
	}
	if v := c.Query("offset"); v != "" {
		if iv, err := strconv.Atoi(v); err == nil {
			q.Offset = iv
		}
	}
	list, err := h.lister.List(c.Request.Context(), q)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"alerts": list})
}

func (h *AlertHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	alert, err := h.lister.Get(c.Request.Context(), id)
	if err != nil {
		handleDomainError(c, err)
		return
	}
	c.JSON(http.StatusOK, alert)
}

func (h *AlertHandler) Resolve(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	alert, err := h.resolver.Resolve(c.Request.Context(), id)
	if err != nil {
		handleDomainError(c, err)
		return
	}
	c.JSON(http.StatusOK, alert)
}

func (h *AlertHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.deleter.DeleteAlert(c.Request.Context(), id); err != nil {
		handleDomainError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func handleDomainError(c *gin.Context, err error) {
	switch err.(type) {
	case domain.ErrValidation:
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	case domain.ErrNotFound:
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	case domain.ErrDuplicate:
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
}
