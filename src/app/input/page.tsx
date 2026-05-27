import { MaintenanceForm } from '@/components/forms/MaintenanceForm'

export default function InputPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-primary mb-6">メンテナンス計画の追加</h2>
      <MaintenanceForm />
    </div>
  )
}
