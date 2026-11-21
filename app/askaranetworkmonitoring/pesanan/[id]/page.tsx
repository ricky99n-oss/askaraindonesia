import OrderStatus from '@/components/anm/OrderStatus'
export const runtime = 'edge'
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <OrderStatus id={(await params).id} /> }
