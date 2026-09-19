CREATE SCHEMA IF NOT EXISTS notification;

CREATE TABLE IF NOT EXISTS notification.alert_type (
  alert_type_id SMALLSERIAL PRIMARY KEY,
  code          VARCHAR(100) NOT NULL UNIQUE,
  name          VARCHAR(255) NOT NULL,
  severity      VARCHAR(50)  NOT NULL DEFAULT 'INFO',
  channel       VARCHAR(50)  NOT NULL DEFAULT 'IN_APP',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,
  created_by    UUID,
  updated_by    UUID,
  deleted_by    UUID,
  row_version   BIGINT       NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS notification.alert (
  alert_id          BIGSERIAL   PRIMARY KEY,
  academic_actor_id BIGINT      NOT NULL,
  alert_type_id     SMALLINT    NOT NULL REFERENCES notification.alert_type (alert_type_id),
  raised_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  created_by        UUID,
  updated_by        UUID,
  deleted_by        UUID,
  row_version       BIGINT      NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_alert_actor ON notification.alert (academic_actor_id);
CREATE INDEX IF NOT EXISTS idx_alert_type ON notification.alert (alert_type_id);

INSERT INTO notification.alert_type (code, name, severity, channel)
VALUES
  ('ABSENCE_THRESHOLD', 'Absence threshold reached', 'WARNING', 'IN_APP'),
  ('SCHEDULE_CONFLICT', 'Schedule conflict detected', 'WARNING', 'IN_APP')
ON CONFLICT (code) DO NOTHING;
