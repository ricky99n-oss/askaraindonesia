import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { transaction_status?: string; order_id?: string }
}) {
  // 🔒 PROTEKSI HALAMAN: Cek apakah ada status lunas dari Midtrans
  const status = searchParams.transaction_status;
  if (status !== 'settlement' && status !== 'capture') {
    // Jika tidak ada bukti lunas, tendang kembali ke halaman utama
    redirect('/'); 
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="bg-white max-w-3xl w-full rounded-2xl shadow-xl overflow-hidden">
        
        {/* HEADER SUKSES */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Pembayaran Berhasil!</h1>
          <p className="text-emerald-100 text-lg">Terima kasih telah bergabung dengan Askara Smart POS</p>
          <p className="text-emerald-100 text-sm mt-2 opacity-80">Order ID: {searchParams.order_id}</p>
        </div>

        <div className="p-8">
          
          {/* SECTION: WHAT TO DO FIRST */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-5 flex items-center gap-2">
              🚀 Apa yang harus dilakukan selanjutnya?
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h3 className="font-semibold text-blue-900">Cek Email Anda</h3>
                  <p className="text-sm text-blue-700">Kami telah mengirimkan detail kredensial dan info masa aktif ke email Anda. <span className="font-bold text-red-500">(Cek folder SPAM jika tidak ada di Inbox)</span>.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <h3 className="font-semibold text-blue-900">Download Aplikasi</h3>
                  <p className="text-sm text-blue-700">Unduh aplikasi Android Askara Smart POS ke perangkat HP atau Tablet Kasir Anda.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-blue-900">Login & Atur Toko</h3>
                  <p className="text-sm text-blue-700">Buka aplikasi, login menggunakan email dan password yang Anda buat di website. Masuk ke menu Manager untuk mulai menambahkan Kategori dan Menu Makanan.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: FITUR HIGHLIGHT */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-5">✨ Fitur yang siap Anda gunakan:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-gray-600 text-sm"><strong>Kasir Pintar</strong><br/>Proses pesanan cepat dengan antarmuka yang ramah pengguna.</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-gray-600 text-sm"><strong>Manajemen Stok</strong><br/>Pantau ketersediaan bahan baku secara real-time.</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-gray-600 text-sm"><strong>Laporan Keuangan</strong><br/>Analisis omzet harian, mingguan, dan bulanan otomatis.</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-gray-600 text-sm"><strong>Koneksi Printer Bluetooth</strong><br/>Cetak struk langsung dari perangkat Anda tanpa ribet.</p>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 border-t pt-8">
            <a 
              href="/download" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-center transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download Aplikasi
            </a>
            <Link 
              href="/" 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-lg text-center transition-colors flex items-center justify-center"
            >
              Kembali ke Beranda
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}