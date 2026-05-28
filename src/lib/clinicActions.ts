import { createClient } from './supabase/client'

export async function addClinic(chainName: string, branchName: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('clinics').insert({
    chain_name:  chainName.trim(),
    branch_name: branchName.trim(),
  })
  if (error) throw new Error(error.message)
}

export async function deleteClinic(clinicId: string): Promise<void> {
  const supabase = createClient()

  const { count } = await supabase
    .from('maintenance_plans')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)

  if (count && count > 0) {
    throw new Error('このクリニックは過去の計画で使用されているため削除できません')
  }

  const { error } = await supabase.from('clinics').delete().eq('id', clinicId)
  if (error) throw new Error(error.message)
}
