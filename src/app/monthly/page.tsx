import { Suspense } from 'react'
import { MonthlyView } from '@/components/calendar/MonthlyView'

export default function MonthlyPage() {
  return (
    <Suspense>
      <MonthlyView />
    </Suspense>
  )
}
