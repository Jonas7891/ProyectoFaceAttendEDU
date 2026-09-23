package usecase

import (
	"context"
	"time"

	"github.com/faceattend/notification-service/internal/domain"
	"github.com/faceattend/notification-service/internal/domain/port"
)

type resolveAlertUseCase struct {
	repo port.AlertRepository
}

func NewResolveAlert(repo port.AlertRepository) port.AlertResolver {
	return &resolveAlertUseCase{repo: repo}
}

func (uc *resolveAlertUseCase) Resolve(ctx context.Context, id int64) (*domain.Alert, error) {
	alert, err := uc.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if alert.IsResolved() {
		return alert, nil
	}
	now := time.Now().UTC()
	alert.ResolvedAt = &now
	t := time.Now().UTC()
	alert.UpdatedAt = &t
	alert.RowVersion++
	if err := uc.repo.Update(ctx, *alert); err != nil {
		return nil, err
	}
	return alert, nil
}


