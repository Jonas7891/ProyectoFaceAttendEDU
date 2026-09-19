package domain

import "time"

type Alert struct {
    AlertID         int64
    AcademicActorID int64
    AlertTypeID     int16
    RaisedAt        time.Time
    ResolvedAt      *time.Time
}
