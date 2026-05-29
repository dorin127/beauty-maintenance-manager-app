ALTER TABLE maintenance_menus ADD COLUMN IF NOT EXISTS cautions JSONB NOT NULL DEFAULT '[]';

-- ボトックス後の熱系施術は効果消失
UPDATE maintenance_menus SET cautions = '[
  {"menu_name": "ハイフ",            "wait_months": 1, "reason": "超音波熱でボトックスが分解され、効果が消失します"},
  {"menu_name": "レーザートーニング", "wait_months": 1, "reason": "熱でボトックスが分解され、効果が消失します"},
  {"menu_name": "フォトフェイシャル", "wait_months": 1, "reason": "光熱でボトックスが分解され、効果が消失します"}
]'::jsonb WHERE name = 'ボトックス';

-- ヒアルロン酸後の熱系施術はHAが溶解
UPDATE maintenance_menus SET cautions = '[
  {"menu_name": "ハイフ",            "wait_months": 1, "reason": "超音波熱でヒアルロン酸が溶解します"},
  {"menu_name": "レーザートーニング", "wait_months": 1, "reason": "熱でヒアルロン酸が変性するリスクがあります"},
  {"menu_name": "フォトフェイシャル", "wait_months": 1, "reason": "熱でヒアルロン酸が変性するリスクがあります"}
]'::jsonb WHERE name = 'ヒアルロン酸';

-- ハイフ後は炎症が続く肌に追加の刺激はNG（ボトックスは問題なし）
UPDATE maintenance_menus SET cautions = '[
  {"menu_name": "レーザートーニング", "wait_months": 1, "reason": "ハイフ後の回復中の肌に追加照射でリスクが高まります"},
  {"menu_name": "フォトフェイシャル", "wait_months": 1, "reason": "ハイフ後の回復中の肌に追加照射でリスクが高まります"},
  {"menu_name": "ケミカルピーリング", "wait_months": 1, "reason": "ハイフ後の回復中の肌にピーリングは追加ダメージになります"}
]'::jsonb WHERE name = 'ハイフ';

-- レーザートーニング後は光感受性が亢進
UPDATE maintenance_menus SET cautions = '[
  {"menu_name": "フォトフェイシャル", "wait_months": 1, "reason": "連続照射で色素細胞にダメージを与える可能性があります"},
  {"menu_name": "ケミカルピーリング", "wait_months": 1, "reason": "光感受性が高まった肌にピーリングは過剰な刺激になります"}
]'::jsonb WHERE name = 'レーザートーニング';

-- フォトフェイシャル後も同様
UPDATE maintenance_menus SET cautions = '[
  {"menu_name": "レーザートーニング", "wait_months": 1, "reason": "連続照射で色素細胞にダメージを与える可能性があります"},
  {"menu_name": "ケミカルピーリング", "wait_months": 1, "reason": "光感受性が高まった肌にピーリングは過剰な刺激になります"}
]'::jsonb WHERE name = 'フォトフェイシャル';

-- ケミカルピーリング後は皮膚バリアが破壊されている
UPDATE maintenance_menus SET cautions = '[
  {"menu_name": "レーザートーニング", "wait_months": 1, "reason": "バリア破壊中のレーザーは重篤な炎症を引き起こします"},
  {"menu_name": "フォトフェイシャル", "wait_months": 1, "reason": "バリア破壊中の光照射は重篤な炎症を引き起こします"},
  {"menu_name": "ハイフ",            "wait_months": 1, "reason": "バリア破壊中の超音波熱エネルギーはリスクがあります"}
]'::jsonb WHERE name = 'ケミカルピーリング';

-- 糸リフト後の熱はPDO/PCL糸を変性・断裂させる
UPDATE maintenance_menus SET cautions = '[
  {"menu_name": "ハイフ",            "wait_months": 3, "reason": "超音波熱がPDO/PCL糸を変性・断裂させる危険性があります"},
  {"menu_name": "レーザートーニング", "wait_months": 1, "reason": "熱が糸周辺の組織に影響する可能性があります"},
  {"menu_name": "フォトフェイシャル", "wait_months": 1, "reason": "熱が糸周辺の組織に影響する可能性があります"}
]'::jsonb WHERE name = '糸リフト';
