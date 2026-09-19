package usecase

import (
	"context"

	"github.com/faceattend/notification-service/internal/domain/port"
)

type deleteAlertUseCase struct {
	repo port.AlertRepository
}

func NewDeleteAlert(repo port.AlertRepository) port.AlertDeleter {
	return &deleteAlertUseCase{repo: repo}
}

func (uc *deleteAlertUseCase) DeleteAlert(ctx context.Context, id int64) error {
	return uc.repo.Delete(ctx, id)
}
