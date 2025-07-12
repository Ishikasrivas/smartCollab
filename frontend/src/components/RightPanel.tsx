import { useState } from 'react'
import { FaList,  FaBell, FaRegComments } from 'react-icons/fa'
import { MdChatBubbleOutline } from 'react-icons/md'

const tabs = [
  { id: 'activity', icon: <FaList />, tooltip: 'Activity Log', title: 'Activity Log' },
  { id: 'comments', icon: <FaRegComments />, tooltip: 'Comments', title: 'Comments' },
  { id: 'notifications', icon: <FaBell />, tooltip: 'Notifications', title: 'Notifications' },
]

export default function RightPanel() {
  const [open, setOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('activity')

  // Floating open button when panel is closed
  if (!open) {
    return (
      <button
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl p-4 flex items-center justify-center focus:outline-none transition-all duration-200 group"
        onClick={() => setOpen(true)}
        aria-label="Open right panel"
      >
        <MdChatBubbleOutline className="text-2xl" />
        <span className="absolute opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded px-2 py-1 ml-12 transition-opacity duration-200 pointer-events-none">Open Activity Panel</span>
      </button>
    )
  }

  return (
    <aside className="h-full bg-gray-900/95 border-l border-gray-700 flex flex-row w-72 min-w-[16rem] max-w-[18rem] transition-transform duration-200 z-20 fixed sm:static top-16 sm:top-0 right-0 overflow-hidden rounded-l-2xl shadow-2xl">
      {/* Vertical Tabs (icons only) */}
      <div className="flex flex-col w-14 bg-gray-800 py-4 items-center gap-2 relative">
        <button
          className="mb-4 text-gray-400 hover:text-white"
          onClick={() => setOpen(false)}
          aria-label="Close right panel"
        >
          <span className="sr-only">Close</span>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-lg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`relative flex items-center justify-center w-10 h-10 rounded-lg mb-2 transition-all duration-200 group ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.tooltip}
          >
            {tab.icon}
            {activeTab === tab.id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-1 h-6 bg-blue-500 rounded-full"></span>
            )}
            <span className="absolute left-12 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded px-2 py-1 transition-opacity duration-200 pointer-events-none whitespace-nowrap">{tab.tooltip}</span>
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-900/80 flex flex-col">
        <div className="text-lg font-semibold text-white mb-4">{tabs.find(t => t.id === activeTab)?.title}</div>
        {activeTab === 'activity' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FaList className="text-4xl mb-2 opacity-40" />
            <span>No recent activity yet.</span>
          </div>
        )}
        {activeTab === 'comments' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FaRegComments className="text-4xl mb-2 opacity-40" />
            <span>No comments yet.</span>
          </div>
        )}
        {activeTab === 'notifications' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FaBell className="text-4xl mb-2 opacity-40" />
            <span>No notifications yet.</span>
          </div>
        )}
      </div>
    </aside>
  )
} 