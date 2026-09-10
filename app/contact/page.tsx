export default function ContactPage() {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Kontak Kami</h1>
        
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
          <p className="text-gray-600 mb-8 text-center text-lg">
            Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi tim Askara Indonesia melalui detail di bawah ini:
          </p>
          
          <div className="space-y-6 max-w-lg mx-auto">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl mr-4">📧</span>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Email</p>
                <p className="text-lg text-gray-900">admin@askaraindonesia.com</p>
              </div>
            </div>
  
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl mr-4">📱</span>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Nomor Telepon / WhatsApp</p>
                <p className="text-lg text-gray-900">+62 812-XXXX-XXXX</p>
              </div>
            </div>
  
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl mr-4">📍</span>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Alamat Usaha</p>
                <p className="text-lg text-gray-900">Malang, Jawa Timur, Indonesia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }