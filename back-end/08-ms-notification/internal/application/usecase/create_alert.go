package usecase

import (
	"context"
	"time"

	"github.com/faceattend/notification-service/internal/domain"
	"github.com/faceattend/notification-service/internal/domain/port"
)

type createAlertUseCase struct {
	repo         port.AlertRepository
	alertTypeRepo port.AlertTypeRepository
}

func NewCreateAlert(repo port.AlertRepository, alertTypeRepo port.AlertTypeRepository) port.AlertCreator {
	return &createAlertUseCase{repo: repo, alertTypeRepo: alertTypeRepo}
}

func (uc *createAlertUseCase) Create(ctx context.Context, cmd port.CreateAlertCommand) (int64, error) {
	if cmd.AcademicActorID == 0 {
		return 0, domain.ErrValidation{Msg: "academic_actor_id is required"}
	}
	if cmd.AlertTypeID == 0 {
		return 0, domain.ErrValidation{Msg: "alert_type_id is required"}
	}
	if uc.alertTypeRepo != nil {
		if _, err := uc.alertTypeRepo.FindByID(ctx, cmd.AlertTypeID); err != nil {
			return 0, err
		}
	}
	alert := domain.Alert{
		AcademicActorID: cmd.AcademicActorID,
		AlertTypeID:     cmd.AlertTypeID,
		RaisedAt:        time.Now().UTC(),
		CreatedAt:       time.Now().UTC(),
		RowVersion:      1,
	}
	if err := alert.Validate(); err != nil {
		return 0, err
	}
	return uc.repo.Save(ctx, alert)
}
