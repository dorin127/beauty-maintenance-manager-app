-- interval_months = 0 は「定期なし（単発）」を意味する
ALTER TABLE maintenance_menus DROP CONSTRAINT IF EXISTS maintenance_menus_default_interval_months_check;
ALTER TABLE maintenance_menus ADD CONSTRAINT maintenance_menus_default_interval_months_check
  CHECK (default_interval_months BETWEEN 0 AND 24);

ALTER TABLE maintenance_plans DROP CONSTRAINT IF EXISTS maintenance_plans_interval_months_check;
ALTER TABLE maintenance_plans ADD CONSTRAINT maintenance_plans_interval_months_check
  CHECK (interval_months BETWEEN 0 AND 24);
