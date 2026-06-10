import React from 'react'
import { DashboardProvider } from '@/contexts/DashboardContext'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-tr from-slate-100 via-zinc-50 to-blue-50/30 text-slate-900">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Right Main Panel */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-transparent flex flex-col">
            {children}
            <Footer />
          </main>
        </div>
      </div>

    </DashboardProvider>
  )
}
