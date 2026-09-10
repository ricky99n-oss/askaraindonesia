export default function FAQPage() {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Pertanyaan yang Sering Diajukan (FAQ)</h1>
        <div className="space-y-6">
          {[
            {
              q: "Bagaimana cara melakukan pemesanan?",
              a: "Anda dapat memilih produk melalui halaman utama atau marketplace kami, lalu ikuti instruksi pembayaran yang tersedia."
            },
            {
              q: "Metode pembayaran apa saja yang didukung?",
              a: "Kami mendukung berbagai metode pembayaran termasuk transfer bank, e-wallet, dan QRIS."
            },
            {
              q: "Bagaimana cara menghubungi customer service?",
              a: "Anda bisa menuju ke halaman Kontak untuk melihat email dan nomor WhatsApp kami."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }