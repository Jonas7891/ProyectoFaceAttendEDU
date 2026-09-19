package port

import "context"

type CreateAlertCommand struct {
    AcademicActorID int64
    AlertTypeID     int16
}
type AlertCreator interface {
    Create(ctx context.Context, cmd CreateAlertCommand) (int64, error)
}
