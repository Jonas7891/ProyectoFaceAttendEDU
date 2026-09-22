package postgres

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/faceattend/notification-service/internal/domain"
)

type AlertTypeRepository struct {
	pool *pgxpool.Pool
}

func NewAlertTypeRepository(pool *pgxpool.Pool) *AlertTypeRepository {
	return &AlertTypeRepository{pool: pool}
}

func (r *AlertTypeRepository) Save(ctx context.Context, at domain.AlertType) (int16, error) {
	if r.pool == nil {
		return 0, errors.New("database not configured")
	}
	var id int16
	err := r.pool.QueryRow(ctx,
		`INSERT INTO notification.alert_type (code, name, severity, channel, created_at, row_version)
		 VALUES ($1,$2,$3,$4,$5,$6) RETURNING alert_type_id`,
		at.Code, at.Name, at.Severity, at.Channel, at.CreatedAt, at.RowVersion).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (r *AlertTypeRepository) FindByID(ctx context.Context, id int16) (*domain.AlertType, error) {
	if r.pool == nil {
		return nil, errors.New("database not configured")
	}
	var at domain.AlertType
	err := r.pool.QueryRow(ctx,
		`SELECT alert_type_id, code, name, severity, channel, created_at, updated_at, row_version
		 FROM notification.alert_type WHERE alert_type_id=$1`, id).
		Scan(&at.AlertTypeID, &at.Code, &at.Name, &at.Severity, &at.Channel, &at.CreatedAt, &at.UpdatedAt, &at.RowVersion)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound{Entity: "alert_type", ID: string(rune(id))}
		}
		return nil, err
	}
	return &at, nil
}

func (r *AlertTypeRepository) FindByCode(ctx context.Context, code string) (*domain.AlertType, error) {
	if r.pool == nil {
		return nil, errors.New("database not configured")
	}
	var at domain.AlertType
	err := r.pool.QueryRow(ctx,
		`SELECT alert_type_id, code, name, severity, channel, created_at, updated_at, row_version
		 FROM notification.alert_type WHERE code=$1`, code).
		Scan(&at.AlertTypeID, &at.Code, &at.Name, &at.Severity, &at.Channel, &at.CreatedAt, &at.UpdatedAt, &at.RowVersion)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, err
		}
		return nil, err
	}
	return &at, nil
}

func (r *AlertTypeRepository) FindAll(ctx context.Context, limit, offset int) ([]domain.AlertType, error) {
	if r.pool == nil {
		return nil, errors.New("database not configured")
	}
	rows, err := r.pool.Query(ctx,
		`SELECT alert_type_id, code, name, severity, channel, created_at, updated_at, row_version
		 FROM notification.alert_type ORDER BY alert_type_id LIMIT $1 OFFSET $2`, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []domain.AlertType
	for rows.Next() {
		var at domain.AlertType
		if err := rows.Scan(&at.AlertTypeID, &at.Code, &at.Name, &at.Severity, &at.Channel, &at.CreatedAt, &at.UpdatedAt, &at.RowVersion); err != nil {
			return nil, err
		}
		out = append(out, at)
	}
	return out, rows.Err()
}

func (r *AlertTypeRepository) Update(ctx context.Context, at domain.AlertType) error {
	if r.pool == nil {
		return errors.New("database not configured")
	}
	ct, err := r.pool.Exec(ctx,
		`UPDATE notification.alert_type SET code=$1, name=$2, severity=$3, channel=$4, updated_at=$5, row_version=$6 WHERE alert_type_id=$7`,
		at.Code, at.Name, at.Severity, at.Channel, at.UpdatedAt, at.RowVersion, at.AlertTypeID)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return domain.ErrNotFound{Entity: "alert_type", ID: string(rune(at.AlertTypeID))}
	}
	return nil
}

func (r *AlertTypeRepository) Delete(ctx context.Context, id int16) error {
	if r.pool == nil {
		return errors.New("database not configured")
	}
	ct, err := r.pool.Exec(ctx, `DELETE FROM notification.alert_type WHERE alert_type_id=$1`, id)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return domain.ErrNotFound{Entity: "alert_type", ID: string(rune(id))}
	}
	return nil
}
