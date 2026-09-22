package config

import (
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/faceattend/notification-service/internal/application/usecase"
	"github.com/faceattend/notification-service/internal/infrastructure/http/handler"
	"github.com/faceattend/notification-service/internal/infrastructure/postgres"
)

type Container struct {
	AlertHandler     *handler.AlertHandler
	AlertTypeHandler *handler.AlertTypeHandler
}

func Wire(pool *pgxpool.Pool) *Container {
	// repos
	alertRepo := postgres.NewAlertRepository(pool)
	alertTypeRepo := postgres.NewAlertTypeRepository(pool)

	// usecases - if pool is nil (local dev without DB), provide in-memory-like fallback stubs via repos still work (they will error on nil pool but handlers still registered)
	createAlert := usecase.NewCreateAlert(alertRepo, alertTypeRepo)
	listAlerts := usecase.NewListAlerts(alertRepo)
	resolveAlert := usecase.NewResolveAlert(alertRepo)
	deleteAlert := usecase.NewDeleteAlert(alertRepo)

	createAlertType := usecase.NewCreateAlertType(alertTypeRepo)
	listAlertTypes := usecase.NewListAlertTypes(alertTypeRepo)
	updateAlertType := usecase.NewUpdateAlertType(alertTypeRepo)
	deleteAlertType := usecase.NewDeleteAlertType(alertTypeRepo)

	alertHandler := handler.NewAlertHandler(createAlert, listAlerts, resolveAlert, deleteAlert)
	alertTypeHandler := handler.NewAlertTypeHandler(createAlertType, listAlertTypes, updateAlertType, deleteAlertType)

	return &Container{
		AlertHandler:     alertHandler,
		AlertTypeHandler: alertTypeHandler,
	}
}
