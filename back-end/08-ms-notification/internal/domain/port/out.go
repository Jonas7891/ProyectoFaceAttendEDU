package port

import (
	"context"
	"github.com/faceattend/notification-service/internal/domain"
)

type AlertRepository interface {
	Save(ctx context.Context, a domain.Alert) (int64, error)
	FindByID(ctx context.Context, id int64) (*domain.Alert, error)
	FindAll(ctx context.Context, filter AlertFilter) ([]domain.Alert, error)
	Update(ctx context.Context, a domain.Alert) error
	Delete(ctx context.Context, id int64) error
}

type AlertFilter struct {
	ActorID  *int64
	TypeID   *int16
	Resolved *bool
	Limit    int
	Offset   int
}

type AlertTypeRepository interface {
	Save(ctx context.Context, at domain.AlertType) (int16, error)
	FindByID(ctx context.Context, id int16) (*domain.AlertType, error)
	FindByCode(ctx context.Context, code string) (*domain.AlertType, error)
	FindAll(ctx context.Context, limit, offset int) ([]domain.AlertType, error)
	Update(ctx context.Context, at domain.AlertType) error
	Delete(ctx context.Context, id int16) error
}
