export default function RefundPolicyPage() {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Kebijakan Pengembalian Dana (Refund Policy)</h1>
        <div className="bg-white shadow rounded-lg p-8 prose prose-blue max-w-none text-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">Syarat Pengembalian Dana</h2>
          <p className="mb-4">Pengembalian dana (refund) hanya dapat diproses dalam kondisi berikut:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Layanan atau produk gagal dikirimkan atau tidak sesuai dengan deskripsi teknis yang disepakati.</li>
            <li>Terjadi kesalahan ganda (double charge) pada sistem pembayaran.</li>
            <li>Permintaan refund diajukan maksimal 7 hari kerja sejak transaksi dilakukan.</li>
          </ul>
  
          <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">Proses Pengajuan</h2>
          <p className="mb-4">Untuk mengajukan refund, silakan hubungi kami melalui detail di halaman Kontak dengan menyertakan Nomor Invoice dan bukti pembayaran. Dana akan dikembalikan ke rekening atau metode pembayaran asli dalam waktu 3-5 hari kerja.</p>
        </div>
      </div>
    );
  }