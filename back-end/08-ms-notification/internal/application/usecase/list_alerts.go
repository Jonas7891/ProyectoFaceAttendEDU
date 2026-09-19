package usecase

import (
	"context"

	"github.com/faceattend/notification-service/internal/domain"
	"github.com/faceattend/notification-service/internal/domain/port"
)

type listAlertsUseCase struct {
	repo port.AlertRepository
}

func NewListAlerts(repo port.AlertRepository) port.AlertLister {
	return &listAlertsUseCase{repo: repo}
}

func (uc *listAlertsUseCase) List(ctx context.Context, q port.ListAlertsQuery) ([]domain.Alert, error) {
	filter := port.AlertFilter{
		ActorID:  q.ActorID,
		TypeID:   q.TypeID,
		Resolved: q.Resolved,
		Limit:    q.Limit,
		Offset:   q.Offset,
	}
	if filter.Limit == 0 {
		filter.Limit = 50
	}
	return uc.repo.FindAll(ctx, filter)
}

func (uc *listAlertsUseCase) Get(ctx context.Context, id int64) (*domain.Alert, error) {
	return uc.repo.FindByID(ctx, id)
}

// AlertType lister

type listAlertTypesUseCase struct {
	repo port.AlertTypeRepository
}

func NewListAlertTypes(repo port.AlertTypeRepository) port.AlertTypeLister {
	return &listAlertTypesUseCase{repo: repo}
}

func (uc *listAlertTypesUseCase) ListTypes(ctx context.Context, q port.ListAlertTypesQuery) ([]domain.AlertType, error) {
	limit := q.Limit
	if limit == 0 {
		limit = 50
	}
	return uc.repo.FindAll(ctx, limit, q.Offset)
}

func (uc *listAlertTypesUseCase) GetType(ctx context.Context, id int16) (*domain.AlertType, error) {
	return uc.repo.FindByID(ctx, id)
}
