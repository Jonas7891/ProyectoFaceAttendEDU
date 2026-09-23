package usecase

import (
	"context"

	"github.com/faceattend/notification-service/internal/domain/port"
)

type deleteAlertTypeUseCase struct {
	repo port.AlertTypeRepository
}

func NewDeleteAlertType(repo port.AlertTypeRepository) port.AlertTypeDeleter {
	return &deleteAlertTypeUseCase{repo: repo}
}

func (uc *deleteAlertTypeUseCase) DeleteAlertType(ctx context.Context, id int16) error {
	return uc.repo.Delete(ctx, id)
}
