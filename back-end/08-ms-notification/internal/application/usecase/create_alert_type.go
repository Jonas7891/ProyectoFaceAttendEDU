package usecase

import (
	"context"
	"time"

	"github.com/faceattend/notification-service/internal/domain"
	"github.com/faceattend/notification-service/internal/domain/port"
)

type createAlertTypeUseCase struct {
	repo port.AlertTypeRepository
}

func NewCreateAlertType(repo port.AlertTypeRepository) port.AlertTypeCreator {
	return &createAlertTypeUseCase{repo: repo}
}

func (uc *createAlertTypeUseCase) CreateAlertType(ctx context.Context, cmd port.CreateAlertTypeCommand) (*domain.AlertType, error) {
	at := domain.AlertType{
		Code:     cmd.Code,
		Name:     cmd.Name,
		Severity: cmd.Severity,
		Channel:  cmd.Channel,
		CreatedAt: time.Now().UTC(),
		RowVersion: 1,
	}
	if at.Channel == "" {
		at.Channel = "DASHBOARD"
	}
	if err := at.Validate(); err != nil {
		return nil, err
	}
	// duplicate check
	if existing, err := uc.repo.FindByCode(ctx, at.Code); err == nil && existing != nil {
		return nil, domain.ErrDuplicate{Msg: "alert_type code already exists: " + at.Code}
	}
	id, err := uc.repo.Save(ctx, at)
	if err != nil {
		return nil, err
	}
	at.AlertTypeID = id
	return &at, nil
}
