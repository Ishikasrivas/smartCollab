import {  FaPlus, FaClipboardList } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// const workspaces = [
//   { id: 1, name: 'Workspace 1' },
//   { id: 2, name: 'Workspace 2' },
// ]

export default function Sidebar() {
  // const [selectedWorkspace, setSelectedWorkspace] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [hoveredBoard, setHoveredBoard] = useState<string | null>(null)
  const [boards, setBoards] = useState<any[]>([])
  const navigate = useNavigate()

  // Fetch boards from backend
  useEffect(() => {
    const fetchBoards = async () => {
      const token = localStorage.getItem('token') || ''
      const res = await fetch('http://localhost:5000/api/boards', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setBoards(data)
      }
    }
    fetchBoards()
  }, [])

  // Add board
  const handleAddBoard = async () => {
    const title = prompt('Enter board name:')
    if (!title) return
    const token = localStorage.getItem('token') || ''
    const res = await fetch('http://localhost:5000/api/boards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    })
    if (res.ok) {
      const newBoard = await res.json()
      setBoards(prev => [...prev, newBoard])
    }
  }

  return (
    <aside className={`bg-gray-900 text-white h-screen overflow-y-auto scrollbar-hide flex flex-col w-64 min-w-[220px] border-r border-gray-800 transition-transform duration-200 z-10 ${sidebarOpen ? '' : '-translate-x-full sm:translate-x-0'} fixed sm:static top-16 sm:top-0 left-0`}>
      {/* Mobile toggle */}
      <button className="sm:hidden p-2 text-gray-400 hover:text-white self-end" onClick={() => setSidebarOpen((v) => !v)}>
        {sidebarOpen ? '✖' : '☰'}
      </button>
      <div className="flex-1 overflow-y-auto p-4">
        {/* <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-300 flex items-center gap-2"><FaBuilding className="text-blue-400" /> My Workspaces</span>
            <button className="text-blue-400 hover:text-blue-300"><FaPlus /></button>
          </div>
          <ul className="space-y-1">
            {workspaces.map(ws => (
              <li key={ws.id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800 ${selectedWorkspace === ws.id ? 'bg-gray-800 font-bold' : ''}`}
                  onClick={() => setSelectedWorkspace(ws.id)}
                >
                  <FaBuilding className="text-blue-400" /> {ws.name}
                </button>
              </li>
            ))}
          </ul>
        </div> */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-300 flex items-center gap-2"><FaClipboardList className="text-teal-400" /> My Boards</span>
            <button className="text-teal-400 hover:text-teal-300" onClick={handleAddBoard}><FaPlus /></button>
          </div>
          <ul className="space-y-1 relative">
            {boards.map(board => (
              <li key={board._id} className="relative">
                <div
                  className="w-full text-left px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800 cursor-pointer"
                  onMouseEnter={() => setHoveredBoard(board._id)}
                  onMouseLeave={() => setHoveredBoard(null)}
                  onClick={() => navigate(`/board/${board._id}`)}
                >
                  <FaClipboardList className="text-teal-400" /> {board.title}
                </div>
                {/* Tooltip Popout (optional, can be enhanced with real stats) */}
                {hoveredBoard === board._id && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-gray-800 text-white rounded-lg shadow-lg px-4 py-3 z-50 min-w-[180px] border border-gray-700 animate-fade-in">
                    <div className="flex items-center gap-2 mb-1 text-sm">
                      <FaClipboardList className="text-blue-400" /> <span>Board ID:</span> <span className="font-bold">{board._id}</span>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
} 