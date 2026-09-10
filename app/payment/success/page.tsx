import Link from 'next/link';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-green-100">
        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h2>
        <p className="text-gray-600 mb-8">Terima kasih, pesanan Anda sedang kami proses.</p>
        <Link href="/marketplace" className="bg-[#4A00E0] text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-900 transition-colors">
          Kembali ke Store
        </Link>
      </div>
    </div>
  );
}