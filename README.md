# Askara Indonesia

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
NEXT_PUBLIC_BASE_URL=https://askaraindonesia.my.id
```

`SUPABASE_SERVICE_ROLE_KEY` dan `RUANG_BOCAH_SUPABASE_SERVICE_KEY` hanya boleh dipasang sebagai secret server, tidak boleh diberi prefix `NEXT_PUBLIC_`.

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
