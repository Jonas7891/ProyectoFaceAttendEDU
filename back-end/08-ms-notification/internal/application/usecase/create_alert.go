package usecase

import (
    "context"
    "github.com/faceattend/notification-service/internal/domain"
    "github.com/faceattend/notification-service/internal/domain/port"
)

type createAlertUseCase struct { repo port.AlertRepository }

func NewCreateAlert(repo port.AlertRepository) port.AlertCreator {
    return &createAlertUseCase{repo: repo}
}

func (uc *createAlertUseCase) Create(ctx context.Context, cmd port.CreateAlertCommand) (int64, error) {
    alert := domain.Alert{AcademicActorID: cmd.AcademicActorID, AlertTypeID: cmd.AlertTypeID}
    if err := uc.repo.Save(ctx, alert); err != nil { return 0, err }
    return 1, nil
}
