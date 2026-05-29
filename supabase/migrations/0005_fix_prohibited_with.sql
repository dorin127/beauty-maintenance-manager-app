-- ボトックス後の熱系施術はNG（効果消失）
UPDATE maintenance_menus
SET prohibited_with = ARRAY['ハイフ', 'レーザートーニング', 'フォトフェイシャル']
WHERE name = 'ボトックス';

-- ハイフ後のボトックスはOKなので空にする
UPDATE maintenance_menus
SET prohibited_with = ARRAY[]::TEXT[]
WHERE name = 'ハイフ';

-- 糸リフト後の熱系施術はNG、ボトックスはOKなので除外
UPDATE maintenance_menus
SET prohibited_with = ARRAY['ハイフ', 'レーザートーニング', 'フォトフェイシャル']
WHERE name = '糸リフト';
