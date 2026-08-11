import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

// Konfigurasi khusus untuk menyesuaikan dengan tema gelap / glassmorphism Sponsor Desk
export const swalTheme = MySwal.mixin({
  background: '#0f172a', // slate-900
  color: '#f8fafc', // slate-50
  customClass: {
    popup: 'border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl bg-slate-900/95',
    title: 'text-xl font-bold text-white',
    htmlContainer: 'text-sm text-purple-200/80',
    confirmButton: 'px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all border-none focus:ring-2 focus:ring-purple-500',
    cancelButton: 'px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all focus:ring-2 focus:ring-slate-500',
    actions: 'flex gap-3 justify-center w-full mt-6',
    loader: 'border-purple-500',
  },
  buttonsStyling: false, // Nonaktifkan style bawaan agar class Tailwind bisa bekerja
})

// Fungsi Helper untuk Loading
export const showLoadingAlert = (title = 'Memproses...') => {
  return swalTheme.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })
}

// Fungsi Helper untuk Sukses
export const showSuccessAlert = (title: string, text?: string) => {
  return swalTheme.fire({
    icon: 'success',
    title,
    text,
    iconColor: '#34d399', // emerald-400
  })
}

// Fungsi Helper untuk Error
export const showErrorAlert = (title: string, text?: string) => {
  return swalTheme.fire({
    icon: 'error',
    title,
    text,
    iconColor: '#f87171', // red-400
  })
}

export default swalTheme
