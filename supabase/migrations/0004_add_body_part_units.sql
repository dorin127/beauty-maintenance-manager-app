ALTER TABLE maintenance_plans ADD COLUMN IF NOT EXISTS body_part text;
ALTER TABLE maintenance_plans ADD COLUMN IF NOT EXISTS units integer;
