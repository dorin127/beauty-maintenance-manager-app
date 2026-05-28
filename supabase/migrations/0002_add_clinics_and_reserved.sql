-- クリニックマスタ（チェーン名＋院名）
CREATE TABLE clinics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_name  TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (chain_name, branch_name)
);

CREATE TRIGGER set_clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- maintenance_plans に clinic_id を追加
ALTER TABLE maintenance_plans
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL;

-- status チェック制約を更新（'reserved' を追加）
ALTER TABLE maintenance_plans
  DROP CONSTRAINT IF EXISTS maintenance_plans_status_check;

ALTER TABLE maintenance_plans
  ADD CONSTRAINT maintenance_plans_status_check
  CHECK (status IN ('planned', 'reserved', 'completed', 'skipped'));
