'use client'

import { useRouter } from 'next/navigation'
import { swalTheme, showLoadingAlert, showSuccessAlert, showErrorAlert } from '@/lib/swal'

export default function CancelBookingButton({ bookingId }: { bookingId: number }) {
  const router = useRouter()

  const handleCancel = async () => {
    const result = await swalTheme.fire({
      title: 'Batalkan Pemesanan?',
      text: 'Semua data pemesanan, materi iklan, dan informasi pembayaran akan dihapus secara permanen. Tindakan ini tidak dapat diurungkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Batalkan!',
      cancelButtonText: 'Kembali',
      confirmButtonColor: '#e11d48', // rose-600
    })

    if (!result.isConfirmed) return

    showLoadingAlert('Membatalkan...')

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        showErrorAlert('Gagal', data.message)
        return
      }

      await swalTheme.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Pemesanan telah dibatalkan.',
        iconColor: '#34d399',
        confirmButtonText: 'Tutup',
      })
      
      router.push('/dashboard')
      router.refresh()
    } catch {
      showErrorAlert('Terjadi kesalahan koneksi.')
    }
  }

  return (
    <button
      onClick={handleCancel}
      className="w-full sm:w-auto px-6 py-2.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
    >
      <span>🗑️ Batalkan Pemesanan</span>
    </button>
  )
}
