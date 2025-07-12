import { useState } from 'react'
import TopNavbar from '../components/TopNavbar'
import Sidebar from '../components/Sidebar'
import MainContent from '../components/MainContent'
import RightPanel from '../components/RightPanel'

export default function Dashboard() {
  // Placeholder for selected board logic
  const [selectedBoardId] = useState<number | undefined>(undefined)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col overflow-x-hidden">
      {/* Top Navbar */}
      <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 min-h-0 w-full max-w-[1600px] mx-auto">
        {/* Sidebar: overlay on mobile, static on desktop */}
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 sm:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}
        <div
          className={`z-50 transition-transform duration-200 fixed sm:static top-16 sm:top-0 left-0 h-full ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`}
          style={{ width: '16rem', minWidth: '220px' }}
        >
          <Sidebar />
        </div>
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-0 px-2 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
          <MainContent selectedBoardId={selectedBoardId} />
        </main>
        {/* Right Panel */}
        <RightPanel />
      </div>
    </div>
  )
} 