'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'

type AdSlot = {
  id: number
  title: string
  category: string
  pricePerDay: number
  allowedFormats: string
  isActive: boolean
}

export default function AdminSlotsTable({ initialSlots }: { initialSlots: AdSlot[] }) {
  const [slots, setSlots] = useState(initialSlots)
  const router = useRouter()

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/slots/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        const updatedSlot = await res.json()
        setSlots((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive: updatedSlot.isActive } : s))
        )
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-purple-200">
          <thead className="bg-purple-900/20 text-xs uppercase text-purple-300">
            <tr>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Judul Slot</th>
              <th className="px-6 py-4 font-semibold">Kategori</th>
              <th className="px-6 py-4 font-semibold">Harga / Hari</th>
              <th className="px-6 py-4 font-semibold">Format Diizinkan</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {slots.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-purple-200/60 italic">
                  Belum ada slot iklan.
                </td>
              </tr>
            ) : (
              slots.map((slot) => (
                <tr key={slot.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        slot.isActive
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {slot.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{slot.title}</td>
                  <td className="px-6 py-4">{slot.category}</td>
                  <td className="px-6 py-4 text-green-400 font-semibold">{formatRupiah(slot.pricePerDay)}</td>
                  <td className="px-6 py-4">{slot.allowedFormats}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggle(slot.id)}
                      className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                    >
                      {slot.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <Link
                      href={`/admin/slots/${slot.id}/edit`}
                      className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium bg-purple-600 border border-purple-500 text-white hover:bg-purple-500 transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
