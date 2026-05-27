-- メンテナンスメニューマスタ
CREATE TABLE maintenance_menus (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    VARCHAR(100) NOT NULL UNIQUE,
  default_interval_months INT NOT NULL CHECK (default_interval_months BETWEEN 1 AND 24),
  prohibited_with         TEXT[] NOT NULL DEFAULT '{}',
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- メンテナンス計画
CREATE TABLE maintenance_plans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id          UUID REFERENCES maintenance_menus(id) ON DELETE SET NULL,
  menu_name        VARCHAR(100) NOT NULL,
  planned_date     DATE NOT NULL,
  interval_months  INT NOT NULL CHECK (interval_months BETWEEN 1 AND 24),
  status           VARCHAR(20) NOT NULL DEFAULT 'planned'
                     CHECK (status IN ('planned', 'completed', 'skipped')),
  completed_date   DATE,
  notes            TEXT,
  series_id        UUID NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- 実施済みの場合は completed_date が必須
  CONSTRAINT completed_requires_date CHECK (
    status != 'completed' OR completed_date IS NOT NULL
  )
);

CREATE INDEX idx_plans_planned_date ON maintenance_plans(planned_date);
CREATE INDEX idx_plans_series_id    ON maintenance_plans(series_id);
CREATE INDEX idx_plans_status       ON maintenance_plans(status);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_menus_updated_at
  BEFORE UPDATE ON maintenance_menus
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_plans_updated_at
  BEFORE UPDATE ON maintenance_plans
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- シードデータ（代表的な美容メンテメニュー）
INSERT INTO maintenance_menus (name, default_interval_months, prohibited_with, notes) VALUES
  ('ボトックス',          4,  ARRAY['ハイフ'],                                 '効果持続：3〜6ヶ月'),
  ('ヒアルロン酸',        6,  ARRAY[]::TEXT[],                                 '効果持続：6〜12ヶ月'),
  ('ハイフ',              6,  ARRAY['ボトックス'],                             '施術後1週間は刺激を避ける'),
  ('レーザートーニング',  1,  ARRAY[]::TEXT[],                                 '月1回が目安'),
  ('フォトフェイシャル',  2,  ARRAY[]::TEXT[],                                 '2ヶ月に1回'),
  ('ケミカルピーリング',  1,  ARRAY['レーザートーニング', 'フォトフェイシャル'], '月1回'),
  ('糸リフト',            12, ARRAY['ハイフ', 'ボトックス'],                   '年1回'),
  ('まつ毛パーマ',        2,  ARRAY[]::TEXT[],                                 '2ヶ月に1回'),
  ('眉毛アートメイク',    12, ARRAY[]::TEXT[],                                 'タッチアップ：年1回');
