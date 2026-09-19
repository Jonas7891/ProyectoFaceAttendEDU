package port

import (
    "context"
    "github.com/faceattend/notification-service/internal/domain"
)
type AlertRepository interface {
    Save(ctx context.Context, a domain.Alert) error
    FindByID(ctx context.Context, id int64) (*domain.Alert, error)
}
