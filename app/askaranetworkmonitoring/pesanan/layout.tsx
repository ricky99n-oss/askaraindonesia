import type { Metadata } from 'next'
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: 'no-referrer', title: 'Pesanan pribadi | Askara Network Monitoring' }
export default function Layout({ children }: { children: React.ReactNode }) { return children }
