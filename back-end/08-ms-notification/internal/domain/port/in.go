package port

import (
	"context"
	"github.com/faceattend/notification-service/internal/domain"
)

type CreateAlertCommand struct {
	AcademicActorID int64 `json:"academic_actor_id" binding:"required" validate:"required"`
	AlertTypeID     int16 `json:"alert_type_id" binding:"required" validate:"required"`
}

type AlertCreator interface {
	Create(ctx context.Context, cmd CreateAlertCommand) (int64, error)
}

type CreateAlertTypeCommand struct {
	Code     string `json:"code" binding:"required" validate:"required"`
	Name     string `json:"name" binding:"required" validate:"required"`
	Severity string `json:"severity" binding:"required" validate:"required"`
	Channel  string `json:"channel"`
}

type AlertTypeCreator interface {
	CreateAlertType(ctx context.Context, cmd CreateAlertTypeCommand) (*domain.AlertType, error)
}

type ListAlertsQuery struct {
	ActorID  *int64
	TypeID   *int16
	Resolved *bool
	Limit    int
	Offset   int
}

type AlertLister interface {
	List(ctx context.Context, q ListAlertsQuery) ([]domain.Alert, error)
	Get(ctx context.Context, id int64) (*domain.Alert, error)
}

type AlertResolver interface {
	Resolve(ctx context.Context, id int64) (*domain.Alert, error)
}

type ListAlertTypesQuery struct {
	Limit  int
	Offset int
}

type AlertTypeLister interface {
	ListTypes(ctx context.Context, q ListAlertTypesQuery) ([]domain.AlertType, error)
	GetType(ctx context.Context, id int16) (*domain.AlertType, error)
}

type UpdateAlertTypeCommand struct {
	Code     string `json:"code"`
	Name     string `json:"name"`
	Severity string `json:"severity"`
	Channel  string `json:"channel"`
}

type AlertTypeUpdater interface {
	UpdateAlertType(ctx context.Context, id int16, cmd UpdateAlertTypeCommand) (*domain.AlertType, error)
}

type AlertTypeDeleter interface {
	DeleteAlertType(ctx context.Context, id int16) error
}

type AlertDeleter interface {
	DeleteAlert(ctx context.Context, id int64) error
}
