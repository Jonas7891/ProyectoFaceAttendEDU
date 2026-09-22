package usecase

import (
	"context"
	"time"

	"github.com/faceattend/notification-service/internal/domain"
	"github.com/faceattend/notification-service/internal/domain/port"
)

type updateAlertTypeUseCase struct {
	repo port.AlertTypeRepository
}

func NewUpdateAlertType(repo port.AlertTypeRepository) port.AlertTypeUpdater {
	return &updateAlertTypeUseCase{repo: repo}
}

func (uc *updateAlertTypeUseCase) UpdateAlertType(ctx context.Context, id int16, cmd port.UpdateAlertTypeCommand) (*domain.AlertType, error) {
	at, err := uc.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if cmd.Code != "" {
		at.Code = cmd.Code
	}
	if cmd.Name != "" {
		at.Name = cmd.Name
	}
	if cmd.Severity != "" {
		at.Severity = cmd.Severity
	}
	if cmd.Channel != "" {
		at.Channel = cmd.Channel
	}
	if err := at.Validate(); err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	at.UpdatedAt = &now
	at.RowVersion++
	if err := uc.repo.Update(ctx, *at); err != nil {
		return nil, err
	}
	return at, nil
}
