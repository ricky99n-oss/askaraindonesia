# Askara Indonesia

## Askara Network Monitoring

- Panel admin: `/internal/network-monitoring`, menu **Lisensi Network Monitoring**.
- API admin: `/api/internal/anm`, mewajibkan sesi internal aktif dengan role `owner`, `admin`, atau `super_admin`.
- Mendukung pembuatan kunci sekali tampil (192 bit acak, SHA-256), pengaturan expired dalam WIB, kuota instalasi/host, pencabutan perangkat, daftar pelanggan dan audit.
- Default menggunakan Supabase internal yang sama. Jika dipisah, set secret server `ANM_SUPABASE_URL` dan `ANM_SUPABASE_SECRET_KEY`; keanggotaan admin tetap diperiksa pada Supabase internal.
- Migrasi ANM ada dalam `supabase/migrations/`. Keduanya telah diterapkan ke proyek `powusazheadrnfbdqxpj` pada 21 November 2026. Jangan jalankan ulang migrasi pertama secara manual pada database yang sudah terpasang.
- Pemulihan password aplikasi: `/anm/reset-password`; halaman setelah verifikasi email: `/anm/verified`. Keduanya ditambahkan pada daftar redirect Supabase tanpa mengganti redirect aplikasi lain.
- Data jaringan pelanggan memakai RLS. Tabel lisensi, aktivasi dan audit hanya dapat dibaca oleh server; pelanggan menggunakan RPC terautentikasi yang dibatasi.
- Riwayat monitoring/insight dibersihkan setelah 30 hari oleh job `anm-retention-daily` pukul 01.17 WIB.

## Konfigurasi push Ruang Bocah

Deployment Cloudflare Pages memerlukan `ONESIGNAL_REST_API_KEY`, `ONESIGNAL_APP_ID`,
`RUANG_BOCAH_APP_VERSION`, dan `RUANG_BOCAH_CRON_SECRET`. Worker
`cloudflare/reminder-cron` berjalan setiap hari pukul 08.00 WIB dan mengirim
pengingat masa aktif H-7, H-3, H-1, dan hari H melalui OneSignal.

Website publik dan dashboard internal Askara Indonesia, termasuk pengelolaan pengguna, subscriber, dan transaksi manual Ruang Bocah.

## Dashboard Ruang Bocah

- Login internal: `/internal/login`
- CRUD pengguna, ringkasan, dan approval transaksi: `/internal/ruangbocah`
- Nomor WhatsApp transaksi manual: `0858-1599-9953`

Environment server yang wajib tersedia untuk integrasi Ruang Bocah:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RUANG_BOCAH_SUPABASE_URL=
RUANG_BOCAH_SUPABASE_SERVICE_KEY=
IPAYMU_VA=
NEXT_PUBLIC_BASE_URL=https://askaraindonesia.com
```

`SUPABASE_SERVICE_ROLE_KEY` dan `RUANG_BOCAH_SUPABASE_SERVICE_KEY` hanya boleh dipasang sebagai secret server, tidak boleh diberi prefix `NEXT_PUBLIC_`.

Untuk login Google aplikasi Ruang Bocah, aktifkan provider Google pada project Supabase
`uwuooxmtclcskrrwptyo` dan tambahkan URL berikut ke **Authentication > URL Configuration > Redirect URLs**:

```text
com.askaraindonesia.ruangbocah://login-callback/**
```

OAuth Client Google harus memakai callback Supabase:

```text
https://uwuooxmtclcskrrwptyo.supabase.co/auth/v1/callback
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
