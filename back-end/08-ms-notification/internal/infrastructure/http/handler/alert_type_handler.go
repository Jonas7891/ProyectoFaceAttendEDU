package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/faceattend/notification-service/internal/domain/port"
)

type AlertTypeHandler struct {
	creator port.AlertTypeCreator
	lister  port.AlertTypeLister
	updater port.AlertTypeUpdater
	deleter port.AlertTypeDeleter
}

func NewAlertTypeHandler(creator port.AlertTypeCreator, lister port.AlertTypeLister, updater port.AlertTypeUpdater, deleter port.AlertTypeDeleter) *AlertTypeHandler {
	return &AlertTypeHandler{creator: creator, lister: lister, updater: updater, deleter: deleter}
}

func (h *AlertTypeHandler) Register(r gin.IRouter) {
	g := r.Group("/api/v1/alert-types")
	g.POST("", h.Create)
	g.GET("", h.List)
	g.GET("/:id", h.Get)
	g.PUT("/:id", h.Update)
	g.DELETE("/:id", h.Delete)

	alt := r.Group("/alert-types")
	alt.POST("", h.Create)
	alt.GET("", h.List)
	alt.GET("/:id", h.Get)
	alt.PUT("/:id", h.Update)
	alt.DELETE("/:id", h.Delete)
}

func (h *AlertTypeHandler) Create(c *gin.Context) {
	var req port.CreateAlertTypeCommand
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	at, err := h.creator.CreateAlertType(c.Request.Context(), req)
	if err != nil {
		handleDomainError(c, err)
		return
	}
	c.JSON(http.StatusCreated, at)
}

func (h *AlertTypeHandler) List(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	list, err := h.lister.ListTypes(c.Request.Context(), port.ListAlertTypesQuery{Limit: limit, Offset: offset})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"alert_types": list})
}

func (h *AlertTypeHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 16)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	at, err := h.lister.GetType(c.Request.Context(), int16(id))
	if err != nil {
		handleDomainError(c, err)
		return
	}
	c.JSON(http.StatusOK, at)
}

func (h *AlertTypeHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 16)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var req port.UpdateAlertTypeCommand
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	at, err := h.updater.UpdateAlertType(c.Request.Context(), int16(id), req)
	if err != nil {
		handleDomainError(c, err)
		return
	}
	c.JSON(http.StatusOK, at)
}

func (h *AlertTypeHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 16)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.deleter.DeleteAlertType(c.Request.Context(), int16(id)); err != nil {
		handleDomainError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
