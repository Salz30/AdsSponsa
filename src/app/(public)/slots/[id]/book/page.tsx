import { Suspense } from 'react'
import Navbar from '@/components/navbar'
import BookingWizard from '@/components/booking-wizard'

export default async function BookingFormPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const slotId = parseInt(resolvedParams.id, 10)

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <Suspense
          fallback={
            <div className="text-center text-purple-300 py-12">
              Memuat formulir pemesanan...
            </div>
          }
        >
          <BookingWizard slotId={slotId} />
        </Suspense>
      </main>
    </div>
  )
}
