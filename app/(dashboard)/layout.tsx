import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
