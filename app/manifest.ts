import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Askara Internal Dashboard',
    short_name: 'Askara App',
    description: 'Sistem Estimator dan Manajemen Internal Askara Indonesia',
    start_url: '/internal/dashboard',
    display: 'standalone',
    background_color: '#f3f4f6',
    theme_color: '#111827',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}