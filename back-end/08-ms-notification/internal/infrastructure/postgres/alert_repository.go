package postgres

import (
	"context"
	"errors"
	"strconv"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/faceattend/notification-service/internal/domain"
	"github.com/faceattend/notification-service/internal/domain/port"
)

type AlertRepository struct {
	pool *pgxpool.Pool
}

func NewAlertRepository(pool *pgxpool.Pool) *AlertRepository {
	return &AlertRepository{pool: pool}
}

func (r *AlertRepository) Save(ctx context.Context, a domain.Alert) (int64, error) {
	if r.pool == nil {
		return 0, errors.New("database not configured")
	}
	var id int64
	err := r.pool.QueryRow(ctx,
		`INSERT INTO notification.alert (academic_actor_id, alert_type_id, raised_at, created_at, row_version)
		 VALUES ($1,$2,$3,$4,$5) RETURNING alert_id`,
		a.AcademicActorID, a.AlertTypeID, a.RaisedAt, a.CreatedAt, a.RowVersion).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (r *AlertRepository) FindByID(ctx context.Context, id int64) (*domain.Alert, error) {
	if r.pool == nil {
		return nil, errors.New("database not configured")
	}
	var a domain.Alert
	err := r.pool.QueryRow(ctx,
		`SELECT alert_id, academic_actor_id, alert_type_id, raised_at, resolved_at, created_at, updated_at, row_version
		 FROM notification.alert WHERE alert_id=$1`, id).
		Scan(&a.AlertID, &a.AcademicActorID, &a.AlertTypeID, &a.RaisedAt, &a.ResolvedAt, &a.CreatedAt, &a.UpdatedAt, &a.RowVersion)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound{Entity: "alert", ID: string(rune(id))}
		}
		return nil, err
	}
	return &a, nil
}

func (r *AlertRepository) FindAll(ctx context.Context, filter port.AlertFilter) ([]domain.Alert, error) {
	if r.pool == nil {
		return nil, errors.New("database not configured")
	}
	query := `SELECT alert_id, academic_actor_id, alert_type_id, raised_at, resolved_at, created_at, updated_at, row_version FROM notification.alert WHERE 1=1`
	args := []interface{}{}
	idx := 1
	if filter.ActorID != nil {
		query += ` AND academic_actor_id=$` + itoa(idx)
		args = append(args, *filter.ActorID)
		idx++
	}
	if filter.TypeID != nil {
		query += ` AND alert_type_id=$` + itoa(idx)
		args = append(args, *filter.TypeID)
		idx++
	}
	if filter.Resolved != nil {
		if *filter.Resolved {
			query += ` AND resolved_at IS NOT NULL`
		} else {
			query += ` AND resolved_at IS NULL`
		}
	}
	query += ` ORDER BY raised_at DESC`
	if filter.Limit > 0 {
		query += ` LIMIT $` + itoa(idx)
		args = append(args, filter.Limit)
		idx++
	}
	if filter.Offset > 0 {
		query += ` OFFSET $` + itoa(idx)
		args = append(args, filter.Offset)
	}
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []domain.Alert
	for rows.Next() {
		var a domain.Alert
		if err := rows.Scan(&a.AlertID, &a.AcademicActorID, &a.AlertTypeID, &a.RaisedAt, &a.ResolvedAt, &a.CreatedAt, &a.UpdatedAt, &a.RowVersion); err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, rows.Err()
}

func (r *AlertRepository) Update(ctx context.Context, a domain.Alert) error {
	if r.pool == nil {
		return errors.New("database not configured")
	}
	ct, err := r.pool.Exec(ctx,
		`UPDATE notification.alert SET resolved_at=$1, updated_at=$2, row_version=$3 WHERE alert_id=$4`,
		a.ResolvedAt, a.UpdatedAt, a.RowVersion, a.AlertID)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return domain.ErrNotFound{Entity: "alert", ID: string(rune(a.AlertID))}
	}
	return nil
}

func itoa(i int) string { return strconv.Itoa(i) }

func (r *AlertRepository) Delete(ctx context.Context, id int64) error {
	if r.pool == nil {
		return errors.New("database not configured")
	}
	ct, err := r.pool.Exec(ctx, `DELETE FROM notification.alert WHERE alert_id=$1`, id)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return domain.ErrNotFound{Entity: "alert", ID: string(rune(id))}
	}
	return nil
}
