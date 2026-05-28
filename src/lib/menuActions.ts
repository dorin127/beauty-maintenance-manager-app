import { createClient } from './supabase/client'

export async function addMenu(input: {
  name: string
  default_interval_months: number
  notes?: string
}): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('maintenance_menus').insert({
    name:                    input.name,
    default_interval_months: input.default_interval_months,
    prohibited_with:         [],
    notes:                   input.notes ?? null,
  })
  if (error) throw new Error(error.message)
}

export async function deleteMenu(menuId: string): Promise<void> {
  const supabase = createClient()

  const { count } = await supabase
    .from('maintenance_plans')
    .select('id', { count: 'exact', head: true })
    .eq('menu_id', menuId)

  if (count && count > 0) {
    throw new Error('このメニューは過去の計画で使用されているため削除できません')
  }

  const { error } = await supabase.from('maintenance_menus').delete().eq('id', menuId)
  if (error) throw new Error(error.message)
}
