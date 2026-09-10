'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const refId = searchParams.get('ref') || 'TRANSAKSI';

  const waMessage = encodeURIComponent(`Halo Askara, saya telah menyelesaikan pembayaran via iPaymu untuk kode pesanan: *${refId}*. Mohon segera diproses.`);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Diterima!</h1>
        <p className="text-gray-500 text-sm mb-2">
          Terima kasih. Bukti pembayaran dan detail pesanan telah dikirimkan ke email Anda oleh sistem iPaymu.
        </p>
        <p className="text-xs font-bold text-gray-400 mb-8 border border-gray-100 py-2 rounded-lg bg-gray-50">
          Order ID: {refId}
        </p>

        <a 
          href={`https://wa.me/6285815999953?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-200 mb-4"
        >
          Konfirmasi via WhatsApp
        </a>
        
        <Link href="/marketplace" className="block w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors text-sm">
          Kembali ke Katalog
        </Link>
      </div>
    </div>
  );
}