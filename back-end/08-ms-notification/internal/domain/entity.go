package domain

import "time"

type Alert struct {
	AlertID         int64
	AcademicActorID int64
	AlertTypeID     int16
	RaisedAt        time.Time
	ResolvedAt      *time.Time
	CreatedAt       time.Time
	UpdatedAt       *time.Time
	RowVersion      int64
}

func (a *Alert) Validate() error {
	if a.AcademicActorID == 0 {
		return ErrValidation{Msg: "academic_actor_id is required"}
	}
	if a.AlertTypeID == 0 {
		return ErrValidation{Msg: "alert_type_id is required"}
	}
	return nil
}

func (a *Alert) IsResolved() bool { return a.ResolvedAt != nil }

type AlertType struct {
	AlertTypeID int16
	Code        string
	Name        string
	Severity    string
	Channel     string
	CreatedAt   time.Time
	UpdatedAt   *time.Time
	RowVersion  int64
}

func (at *AlertType) Validate() error {
	if at.Code == "" {
		return ErrValidation{Msg: "code is required"}
	}
	if at.Name == "" {
		return ErrValidation{Msg: "name is required"}
	}
	if at.Severity == "" {
		return ErrValidation{Msg: "severity is required"}
	}
	return nil
}

type ErrValidation struct{ Msg string }

func (e ErrValidation) Error() string { return e.Msg }

type ErrNotFound struct{ Entity, ID string }

func (e ErrNotFound) Error() string { return e.Entity + " not found: " + e.ID }

type ErrDuplicate struct{ Msg string }

func (e ErrDuplicate) Error() string { return e.Msg }
