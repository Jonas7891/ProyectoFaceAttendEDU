-- Auto-create schemas for all microservices (used on first postgres init)
CREATE SCHEMA IF NOT EXISTS "identity";
CREATE SCHEMA IF NOT EXISTS "authorization";
CREATE SCHEMA IF NOT EXISTS "scheduling";
CREATE SCHEMA IF NOT EXISTS "attendance";
CREATE SCHEMA IF NOT EXISTS "notification";
-- For completeness (academic/configuration use public but ensure)
-- Academic and configuration use Drizzle with default public, no separate schema needed
