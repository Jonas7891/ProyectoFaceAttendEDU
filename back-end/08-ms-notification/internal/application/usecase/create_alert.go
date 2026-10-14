package usecase

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/faceattend/notification-service/internal/domain"
	"github.com/faceattend/notification-service/internal/domain/port"
	"github.com/faceattend/notification-service/internal/infrastructure/webhook"
)

// notifyTimeout bounds the fire-and-forget webhook call: it runs detached
// from the request context (which gin cancels once the handler returns), so
// it needs its own deadline instead of inheriting one that is already gone.
const notifyTimeout = 10 * time.Second

type createAlertUseCase struct {
	repo          port.AlertRepository
	alertTypeRepo port.AlertTypeRepository
	notifier      webhook.Notifier
}

func NewCreateAlert(repo port.AlertRepository, alertTypeRepo port.AlertTypeRepository, notifier webhook.Notifier) port.AlertCreator {
	return &createAlertUseCase{repo: repo, alertTypeRepo: alertTypeRepo, notifier: notifier}
}

func (uc *createAlertUseCase) Create(ctx context.Context, cmd port.CreateAlertCommand) (int64, error) {
	if cmd.AcademicActorID == 0 {
		return 0, domain.ErrValidation{Msg: "academic_actor_id is required"}
	}
	if cmd.AlertTypeID == 0 {
		return 0, domain.ErrValidation{Msg: "alert_type_id is required"}
	}
	var alertType *domain.AlertType
	if uc.alertTypeRepo != nil {
		found, err := uc.alertTypeRepo.FindByID(ctx, cmd.AlertTypeID)
		if err != nil {
			return 0, err
		}
		alertType = found
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
	id, err := uc.repo.Save(ctx, alert)
	if err != nil {
		return 0, err
	}
	alert.AlertID = id

	// DASHBOARD alerts are meant to be seen in-app only; EMAIL/PUSH are the
	// ones that need an external delivery. Never block the response on it:
	// a slow or unreachable receiver must not make alert creation time out.
	if uc.notifier != nil && alertType != nil && alertType.Channel != "" && alertType.Channel != "DASHBOARD" {
		go notifyAsync(uc.notifier, alert, *alertType)
	}

	return id, nil
}

func notifyAsync(notifier webhook.Notifier, alert domain.Alert, alertType domain.AlertType) {
	ctx, cancel := context.WithTimeout(context.Background(), notifyTimeout)
	defer cancel()

	payload := webhook.Payload{
		AlertID:         alert.AlertID,
		AcademicActorID: alert.AcademicActorID,
		AlertTypeID:     alert.AlertTypeID,
		AlertTypeCode:   alertType.Code,
		Severity:        alertType.Severity,
		Channel:         alertType.Channel,
		RaisedAt:        alert.RaisedAt.Format(time.RFC3339),
	}

	if err := notifier.Notify(ctx, payload); err != nil {
		if !errors.Is(err, webhook.ErrNotConfigured) {
			log.Printf("ERROR: alert webhook delivery failed alert_id=%d type=%s err=%v", alert.AlertID, alertType.Code, err)
		}
		return
	}
	log.Printf("INFO: alert webhook delivered alert_id=%d type=%s channel=%s", alert.AlertID, alertType.Code, alertType.Channel)
}
