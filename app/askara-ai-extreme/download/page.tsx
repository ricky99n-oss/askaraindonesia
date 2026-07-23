import Link from 'next/link';

export default function AskaraDownloadPage() {
  // TODO: Ganti URL di bawah ini dengan URL Public dari Supabase Bucket "EA" Anda
  const EA_FILE_URL = "https://powusazheadrnfbdqxpj.supabase.co/storage/v1/object/public/EA/AskaraAIExtreme.ex5";
  const GUIDE_FILE_URL = "https://powusazheadrnfbdqxpj.supabase.co/storage/v1/object/public/EA/Askara_AI_Extreme_EA_Panduan_Lengkap-2.pdf";

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans pt-24 pb-20 px-4 md:px-8 selection:bg-blue-500">
      <div className="max-w-5xl mx-auto">
        
        {/* ================= HEADER SUCCESS ================= */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 text-green-400 rounded-full mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Pembayaran Berhasil! 🎉
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Selamat datang di era baru algorithmic trading. Mesin <strong>Askara AI Extreme</strong> Anda sudah siap digunakan.
          </p>
        </div>

        {/* ================= ALERT LISENSI ================= */}
        <div className="bg-gradient-to-r from-blue-900/40 to-gray-800 border border-blue-500/50 rounded-2xl p-6 md:p-8 mb-12 shadow-lg flex flex-col md:flex-row gap-6 items-center">
          <div className="text-5xl drop-shadow-lg">🔐</div>
          <div>
            <h3 className="text-xl font-bold text-blue-300 mb-2">Periksa Kotak Masuk Email Anda</h3>
            <p className="text-gray-300 leading-relaxed">
              Sistem kami telah mengirimkan <strong>License Key</strong> rahasia ke email Anda. 
              Gunakan Username dan License Key tersebut pada menu input EA. 
              <br/><span className="text-yellow-400 text-sm mt-2 inline-block">⚠️ Penting: 1 Lisensi akan terkunci secara otomatis (HWID Locked) pada VPS/PC pertama tempat EA dipasang.</span>
            </p>
          </div>
        </div>

        {/* ================= DOWNLOAD CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {/* Card EA */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-gray-800/80 transition-all duration-300 group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
            <h3 className="text-2xl font-bold mb-2">File EA & Sistem</h3>
            <p className="text-sm text-gray-400 mb-8 h-10">File <code className="text-blue-300">.ex5</code> yang sudah dienkripsi dan siap dipasang di MT5 Anda.</p>
            <a 
              href={EA_FILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Unduh File EA (.ex5)
            </a>
          </div>

          {/* Card Panduan */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center hover:border-green-500 hover:bg-gray-800/80 transition-all duration-300 group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📖</div>
            <h3 className="text-2xl font-bold mb-2">Buku Panduan PDF</h3>
            <p className="text-sm text-gray-400 mb-8 h-10">Dokumentasi offline yang bisa Anda simpan dan baca kapan saja.</p>
            <a 
              href={GUIDE_FILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full justify-center items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-green-500/25 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Unduh Panduan (.pdf)
            </a>
          </div>
        </div>

        {/* ================= MASTERCLASS: CARA KERJA EA & AI ================= */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-white border-b border-gray-800 pb-4">
            Masterclass: Memahami Sistem Askara
          </h2>
          
          {/* Bagian 1: Otak vs Otot */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-xl mb-8">
            <div className="bg-gray-800 p-6 md:p-8 border-b border-gray-700">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">1. Pembagian Tugas: Otak (AI) vs Otot (MT5)</h3>
              <p className="text-gray-300 leading-relaxed">
                Askara AI Extreme membagi tugas menjadi dua bagian utama. Memahami batasan ini adalah kunci untuk menciptakan strategi yang sukses:
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-700">
              {/* Kolom AI Prompt */}
              <div className="p-6 md:p-8 bg-gray-900/50">
                <div className="text-3xl mb-3">🧠</div>
                <h4 className="text-xl font-bold mb-2">Tugas Otak (Kolom Prompt AI)</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Google Gemini bertugas sebagai <strong>Analis Sinyal (Entry)</strong>. Ia menganalisis indikator dan harga, lalu memutuskan apakah harus BUY, SELL, atau HOLD.
                </p>
                <div className="bg-black/50 border border-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-xs text-green-400 font-mono mb-2">✅ CONTOH PROMPT YANG BENAR:</p>
                  <p className="text-sm italic text-gray-300">"Gunakan Price Action. OP posisi BUY ketika MA 5 menyilang di atas MA 10. Jika tren sedang sideways, balas HOLD."</p>
                </div>
                <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-4">
                  <p className="text-xs text-red-400 font-mono mb-2">❌ JANGAN TULIS INI DI PROMPT:</p>
                  <p className="text-sm italic text-gray-400 line-through">"Gunakan lot 0.01 dan close posisi jika profit sudah $1."</p>
                  <p className="text-xs text-gray-500 mt-2">Alasan: AI tidak memegang uang dan tidak memantau floating profit per detik.</p>
                </div>
              </div>

              {/* Kolom MT5 Input */}
              <div className="p-6 md:p-8 bg-gray-900/50">
                <div className="text-3xl mb-3">⚙️</div>
                <h4 className="text-xl font-bold mb-2">Tugas Otot (Menu Setting EA)</h4>
                <p className="text-gray-400 text-sm mb-4">
                  MetaTrader 5 bertugas sebagai <strong>Eksekutor Manajemen Keuangan</strong>. Ia mengatur ukuran Lot, Jarak Stop Loss, Take Profit, dan keamanan Trailing.
                </p>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-blue-400">❖</span> 
                    <span><strong>Base Lot:</strong> Menentukan ukuran lot awal.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">❖</span> 
                    <span><strong>Compounding Multiplier:</strong> Mengatur seberapa besar lot dilipatgandakan saat Win Streak.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">❖</span> 
                    <span><strong>Base SL & TP:</strong> Target profit dan batas kerugian dalam hitungan <em>Pips</em>.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">❖</span> 
                    <span><strong>Trailing Stop & BE:</strong> Mengunci profit yang sudah berjalan secara otomatis.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bagian 2: AI Confidence */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-gray-800 p-6 md:p-8 border-b border-gray-700">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">2. AI Minimum Confidence (Filter Kepastian)</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Tidak seperti EA tradisional yang bersifat biner (Ya/Tidak), AI mampu menimbang <strong>probabilitas</strong>. 
                Jika AI menyuruh "BUY" tetapi dia hanya merasa 75% yakin (karena ada <i>Resistance</i> dekat), parameter <strong>Minimum AI Confidence</strong> akan menjadi <em>Gerbang Keselamatan</em> Anda.
              </p>

              <div className="bg-black/50 border border-gray-800 rounded-lg p-5 font-mono text-sm">
                <p className="text-gray-500 mb-2">// Contoh Skenario: Setting EA Anda diatur di <span className="text-white">95%</span></p>
                <p className="text-green-400 mb-1">&gt; AI Sinyal: BUY (Keyakinan: 98%) ➔ <strong>EKSEKUSI JALAN</strong></p>
                <p className="text-red-400">&gt; AI Sinyal: SELL (Keyakinan: 80%) ➔ <strong>DITOLAK EA (DIBATALKAN)</strong></p>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <h4 className="font-bold text-lg mb-6">Panduan Mengatur Karakter EA Anda:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 border border-green-500/30 p-5 rounded-xl">
                  <div className="text-green-400 font-bold text-xl mb-1">95% - 99%</div>
                  <div className="font-bold mb-3">Mode Sniper</div>
                  <p className="text-xs text-gray-400">Sangat jarang masuk pasar, namun memiliki akurasi eksekusi tertinggi. AI hanya mengambil setup "A+" yang sempurna. Cocok untuk modal besar.</p>
                </div>
                <div className="bg-gray-900/50 border border-blue-500/30 p-5 rounded-xl">
                  <div className="text-blue-400 font-bold text-xl mb-1">80% - 90%</div>
                  <div className="font-bold mb-3">Mode Balanced</div>
                  <p className="text-xs text-gray-400">Keseimbangan ideal antara frekuensi transaksi dan akurasi. Filter yang bagus untuk gaya <em>Day Trading</em> harian.</p>
                </div>
                <div className="bg-gray-900/50 border border-orange-500/30 p-5 rounded-xl">
                  <div className="text-orange-400 font-bold text-xl mb-1">60% - 75%</div>
                  <div className="font-bold mb-3">Mode Agresif</div>
                  <p className="text-xs text-gray-400">Frekuensi trading sangat tinggi. Sekecil apapun peluangnya, AI akan menembak. Berisiko tinggi, cocok dipadukan dengan <em>Scalping</em> lot kecil.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= STEP BY STEP PANDUAN ================= */}
        <h2 className="text-3xl font-bold mb-8 text-center text-white border-b border-gray-800 pb-4">
          Langkah Persiapan Wajib
        </h2>
        
        <div className="space-y-8 mb-16">
          
          {/* STEP 1: GEMINI API */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -z-0"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-500/30">1</div>
              <div className="w-full">
                <h3 className="text-xl font-bold mb-2">Dapatkan Google Gemini API Key (Gratis)</h3>
                <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                  EA membutuhkan akses ke otak Google Gemini untuk berpikir. Anda harus membuat kunci (API Key) milik Anda sendiri.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                  <li>Buka browser dan kunjungi: <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://aistudio.google.com/</a></li>
                  <li>Login menggunakan akun Google (Gmail) Anda.</li>
                  <li>Di panel kiri, klik tombol <strong>"Get API key"</strong>, lalu klik <strong>"Create API key"</strong>.</li>
                  <li>Pilih opsi membuat key pada project baru.</li>
                  <li>Salin teks panjang yang muncul (contoh: <code>AIzaSyD...</code>). <strong>Masukkan teks ini ke menu Setting EA di MT5 nanti.</strong></li>
                </ol>
              </div>
            </div>
          </div>

          {/* STEP 2: TELEGRAM BOT */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-bl-full -z-0"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sky-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-sky-500/30">2</div>
              <div className="w-full">
                <h3 className="text-xl font-bold mb-2">Buat Notifikasi Telegram (Opsional tapi Direkomendasikan)</h3>
                <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                  Agar EA bisa mengirim laporan Profit & Win Streak ke HP Anda, buatlah Bot khusus.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <h5 className="font-bold text-blue-300 mb-2 text-sm">A. Mendapatkan Bot Token</h5>
                    <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                      <li>Buka Telegram, cari <strong>@BotFather</strong>.</li>
                      <li>Ketik <code>/newbot</code>, lalu beri nama bot Anda.</li>
                      <li>Salin <strong>HTTP API Token</strong> yang diberikan.</li>
                    </ol>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <h5 className="font-bold text-green-300 mb-2 text-sm">B. Mendapatkan Chat ID</h5>
                    <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                      <li>Di Telegram, cari <strong>@userinfobot</strong>.</li>
                      <li>Kirim pesan bebas, lalu salin angka pada baris <strong>Id</strong>.</li>
                      <li className="text-yellow-400 mt-2 font-semibold">⚠️ Wajib: Buka bot yang Anda buat di Langkah A, lalu klik START agar EA bisa mengirim pesan!</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: MT5 WHITELIST & INSTALL */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full -z-0"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-green-500/30">3</div>
              <div className="w-full">
                <h3 className="text-xl font-bold mb-2">Instalasi & Whitelist URL di MT5</h3>
                <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                  EA tidak akan menyala jika MT5 Anda memblokir koneksi internet ke Google dan Server Lisensi.
                </p>
                
                <div className="space-y-4">
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <h5 className="font-bold text-red-400 mb-2 text-sm">Langkah Paling Penting (Whitelist):</h5>
                    <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                      <li>Buka MetaTrader 5, klik menu <strong>Tools</strong> &gt; <strong>Options</strong>.</li>
                      <li>Pilih tab <strong>Expert Advisors</strong>.</li>
                      <li>Centang kotak <strong>"Allow WebRequest for listed URL"</strong>.</li>
                      <li>Tambahkan 3 alamat berikut (klik tanda +, ketik, tekan Enter):
                        <ul className="list-disc list-inside ml-6 mt-1 text-gray-400 font-mono text-xs">
                          <li>https://askaraindonesia.my.id</li>
                          <li>https://generativelanguage.googleapis.com</li>
                          <li>https://api.telegram.org</li>
                        </ul>
                      </li>
                      <li>Klik <strong>OK</strong>.</li>
                    </ol>
                  </div>
                  
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <h5 className="font-bold text-white mb-2 text-sm">Cara Pemasangan EA:</h5>
                    <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                      <li>Buka MT5, klik <strong>File</strong> &gt; <strong>Open Data Folder</strong>.</li>
                      <li>Pindahkan file <code>AskaraAIExtreme.ex5</code> ke folder <strong>MQL5 &gt; Experts</strong>.</li>
                      <li>Di MT5, buka jendela <em>Navigator</em>, klik kanan <em>Expert Advisors</em> &gt; Refresh.</li>
                      <li>Tarik (Drag & Drop) EA ke dalam grafik (Chart).</li>
                      <li>Isi Username, License Key (dari email), dan API Key Anda di tab <em>Inputs</em>. Klik OK!</li>
                    </ol>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* ================= SUPPORT FOOTER ================= */}
        <div className="text-center text-gray-400 bg-gray-800/30 py-8 rounded-2xl border border-gray-800">
          <p className="mb-4">Mengalami kesulitan saat instalasi atau lisensi terkunci (HWID Mismatch)?</p>
          <a 
            href="https://t.me/askara_ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-white font-bold bg-blue-600 hover:bg-blue-500 py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.667 3.473-1.512 5.79-2.512 6.95-2.99 3.306-1.364 3.993-1.603 4.437-1.611z"/></svg>
            Hubungi Tim Support Askara
          </a>
        </div>

      </div>
    </div>
  );
}