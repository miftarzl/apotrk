import AdminLayout from '@/components/AdminLayout'

export const metadata = { title: 'Admin - Apotek Sehati Jaya Farma' }

export default function AdminRoot({ children }: { children: React.ReactNode }){
  return (
    <AdminLayout>{children}</AdminLayout>
  )
}
