# Askara Network Monitoring: penjualan dan lisensi

Halaman publik: `/askaranetworkmonitoring`, pembelian: `/askaranetworkmonitoring/beli`, status privat: `/askaranetworkmonitoring/pesanan/[id]`.

Admin: `/internal/network-monitoring` untuk lisensi, dan `/internal/network-monitoring-shop` untuk pesanan, harga, serta Telegram. Hanya anggota internal aktif dengan role owner, admin, atau super_admin yang dapat mengelola fitur ini.

## Paket awal

| Paket | Harga / 30 hari | Instalasi | Host |
| --- | ---: | ---: | ---: |
| Starter | Rp22.000 (normal Rp40.000) | 1 | 50 |
| Pro | Rp45.000 | 2 | 256 |
| Enterprise | Rp60.000 | 4 | 1.024 |

Harga, promo, durasi dan kuota dapat diedit pada tab Paket. Data pesanan menyimpan snapshot paket; perubahan harga berikutnya tidak mengubah invoice yang sudah terbit.

## Alur pesanan

1. Pembeli mengisi nama, email, paket, dan jenis baru/perpanjangan. Server menetapkan nominal dan kuota dari katalog database, bukan nilai yang dikirim browser.
2. Pembeli menerima nomor pesanan dan tautan status privat melalui email, membayar QRIS Askara, lalu mengunggah JPG/PNG/WebP maksimal 5 MB.
3. Bukti disimpan pada bucket privat. Bot mengirim detail pesanan dan dokumen bukti ke chat admin.
4. Admin memeriksa dana merchant lalu membalas pesan bukti dengan `OK` atau `TOLAK alasan`. Tombol bot dan pengelolaan pada dashboard juga tersedia.
5. Persetujuan menerbitkan lisensi baru atau menambah durasi pada lisensi yang sama. Perpanjangan mempertahankan sisa masa aktif. Penolakan tidak menerbitkan lisensi. Hasil dikirim melalui email.

Keputusan diproses dalam transaksi dengan penguncian baris dan tidak dapat menggandakan lisensi atau masa aktif ketika event diulang. Hanya chat dan ID pengguna Telegram pada allow list yang diterima. Webhook memakai secret header.

## Konfigurasi server

Pada Cloudflare Pages, simpan sebagai secret server:

- `ANM_SUPABASE_SECRET_KEY` dan `ANM_SUPABASE_URL` (atau URL publik proyek utama).
- `ANM_COMMERCE_ENCRYPTION_KEY`: 32 byte dalam base64, untuk AES-GCM. Cadangkan secara privat; jangan menggantinya tanpa migrasi ciphertext lama.
- `ANM_RESEND_API_KEY` dan `ANM_EMAIL_FROM`: kredensial pengiriman pesanan pada domain terverifikasi.
- `ANM_ORDER_CRON_SECRET`: token privat untuk worker pengiriman ulang.

Tidak satu pun secret memakai prefix `NEXT_PUBLIC_`. Token bot disimpan terenkripsi di `anm_shop_settings`; UI admin tidak menerima nilainya kembali.

Konfigurasi bot melalui dashboard Telegram: token BotFather, chat ID dan ID admin. Penyimpan pengaturan harus merupakan admin internal aktif. Webhook: `https://askaraindonesia.com/api/anm/telegram`. Aktifkan penerimaan pesanan baru setelah konfigurasi lengkap.

## Database dan penyimpanan

SQL tersedia dalam `supabase/network-monitoring/`, untuk proyek ANM yang sama dengan aplikasi Flutter. Terapkan berurutan pada proyek yang tepat. Jangan menerapkannya ke proyek Ruang Bocah yang terpisah.

Tabel komersial tambahan: `anm_shop_settings`, `anm_products`, `anm_orders`, `anm_order_tasks`. Semuanya memakai RLS dan tidak dapat diakses langsung oleh anon/authenticated. API server memeriksa admin atau token pesanan acak yang hanya disimpan sebagai hash. Token status berada pada fragmen tautan email dan dihapus dari address bar saat halaman dibuka.

Bucket `anm-payment-proofs` bersifat privat. Akses admin menghasilkan URL bertanda tangan selama 60 detik. Browser dan server membatasi ukuran, dan server memeriksa signature gambar. License key pesanan disimpan terenkripsi untuk pengiriman ulang; tabel lisensi utama tetap menyimpan hash.

## Pengiriman ulang

Email dan notifikasi memiliki antrian privat, lease dan batas percobaan. Worker pada `cloudflare/anm-orders-cron` memanggil endpoint privat setiap 5 menit. Pasang secret `ANM_ORDER_CRON_SECRET` yang sama pada worker. Tombol Coba kirim ulang pada dashboard tersedia untuk admin.

Gunakan idempotency key email dan transaksi database untuk menghadapi retry. Jangan mengirim license key melalui log, webhook publik, atau kode browser. Jangan menampilkan bukti pembayaran pada landing page atau bucket publik.

## Distribusi Android

Rilis 2.0.2 ARM64 tersedia pada GitHub Release `anm-v2.0.2`. Android 7.0+ diperlukan. Aplikasi memerlukan internet untuk login/lisensi dan monitoring berjalan saat aplikasi terbuka. Windows x64 tersedia sebagai installer EXE dan ZIP portable untuk Windows 10 (1809+) / Windows 11. Halaman produk menampilkan unduhan Android dan Windows, serta panduan PDF. Source Flutter dan workflow build Windows disimpan pada repository privat `ricky99n-oss/askara-network-monitoring`; hanya binari hasil rilis dipublikasikan pada release `anm-v2.0.2` di repository website.
