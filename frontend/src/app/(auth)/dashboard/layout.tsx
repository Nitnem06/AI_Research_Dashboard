import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { TopNavbar } from "@/components/dashboard/top-navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <AppSidebar />

      <main className="flex-1 overflow-hidden">
        <TopNavbar />

        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}