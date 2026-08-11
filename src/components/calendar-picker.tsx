'use client'

import { useState } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import { format, addDays, isWithinInterval, parseISO } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { calculateDays, formatRupiah } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import 'react-day-picker/dist/style.css'

interface BookingRange {
  startDate: string
  endDate: string
}

interface CalendarPickerProps {
  slotId: number
  pricePerDay: number
  blockedRanges: BookingRange[]
}

export default function CalendarPicker({
  slotId,
  pricePerDay,
  blockedRanges,
}: CalendarPickerProps) {
  const router = useRouter()
  const [range, setRange] = useState<DateRange | undefined>()

  // Convert string ranges to Date objects
  const disabledDates = blockedRanges.map((b) => ({
    from: new Date(b.startDate),
    to: new Date(b.endDate),
  }))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Disable past dates
  const isDateDisabled = (date: Date) => {
    if (date < today) return true
    return disabledDates.some(
      (d) => date >= d.from && date <= d.to
    )
  }

  const daysCount =
    range?.from && range?.to ? calculateDays(range.from, range.to) : 0
  const totalPrice = daysCount * pricePerDay

  const handleProceedBooking = () => {
    if (!range?.from || !range?.to) return
    const fromStr = format(range.from, 'yyyy-MM-dd')
    const toStr = format(range.to, 'yyyy-MM-dd')
    router.push(`/slots/${slotId}/book?from=${fromStr}&to=${toStr}&price=${pricePerDay}`)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl text-white">
      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
        <span>📅</span> Pilihan Tanggal Penayangan
      </h3>
      <p className="text-xs text-purple-200/70 mb-6">
        Pilih rentang tanggal mulai dan tanggal selesai di kalender. Tanggal yang sudah di-booking bertanda tidak aktif.
      </p>

      {/* DayPicker Calendar */}
      <div className="flex justify-center p-4 bg-slate-900/60 rounded-xl border border-white/5 mb-6 shadow-inner">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          disabled={isDateDisabled}
          locale={idLocale}
          modifiersStyles={{
            selected: { backgroundColor: '#9333ea', color: 'white' },
            disabled: { opacity: 0.3, textDecoration: 'line-through' },
          }}
          className="text-white font-sans"
        />
      </div>

      {/* Cost Calculator Widget */}
      <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center text-xs text-purple-200 mb-2">
          <span>Rentang Terpilih:</span>
          <span className="font-semibold text-white">
            {range?.from
              ? `${format(range.from, 'd MMM yyyy', { locale: idLocale })} ${
                  range.to ? `- ${format(range.to, 'd MMM yyyy', { locale: idLocale })}` : '(pilih tgl selesai)'
                }`
              : 'Belum memilih tanggal'}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs text-purple-200 mb-3 border-b border-purple-500/20 pb-2">
          <span>Jumlah Hari:</span>
          <span className="font-bold text-purple-300 text-sm">{daysCount} Hari</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-white">ESTIMASI TOTAL:</span>
          <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-white">
            {formatRupiah(totalPrice)}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleProceedBooking}
        disabled={!range?.from || !range?.to}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:hover:from-purple-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
      >
        <span>Lanjut ke Formulir Pemesanan</span>
        <span>→</span>
      </button>
    </div>
  )
}
