import { FaBell, FaCheckCircle, FaClipboardList, FaChartLine, FaPlus } from 'react-icons/fa'
import {  useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

const activityData = [
  { day: 'Mon', value: 2 },
  { day: 'Tue', value: 4 },
  { day: 'Wed', value: 3 },
  { day: 'Thu', value: 6 },
  { day: 'Fri', value: 5 },
  { day: 'Sat', value: 7 },
  { day: 'Sun', value: 4 },
]

function statusColor(status: string) {
  switch (status) {
    case 'Done': return 'bg-green-600';
    case 'In Progress': return 'bg-yellow-500';
    case 'To Do': return 'bg-blue-600';
    default: return 'bg-gray-500';
  }
}

export default function DashboardOverview() {
  const [showModal, setShowModal] = useState(false)
  const [boards, setBoards] = useState<any[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBoards = async () => {
      const token = localStorage.getItem('token') || ''
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/boards`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch boards')
        const data = await res.json()
        setBoards(data)
        // For demo, use the first 5 tasks from all boards as recently viewed
        const tasks = data.flatMap((b: any) => (b.columns || []).flatMap((c: any) => c.tasks || []))
        setRecentlyViewed(tasks.slice(0, 5))
      } catch (err) {
        setBoards([])
        setRecentlyViewed([])
      }
    }
    fetchBoards()
  }, [])

  return (
    <div className="w-full flex flex-col gap-6 relative">
      <div className="text-2xl font-bold text-white mb-2">Good Morning, Naman!</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className="bg-gray-800 rounded-xl p-6 flex items-center gap-4 shadow transition-transform duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer group"
          onClick={() => navigate('/tasks?filter=due-today')}
        >
          <FaBell className="text-yellow-400 text-3xl group-hover:animate-bounce" />
          <div>
            <div className="text-lg font-semibold text-white">{recentlyViewed.filter(t => t.status === 'To Do').length}</div>
            <div className="text-gray-400 text-sm">Tasks due today</div>
          </div>
        </div>
        <div
          className="bg-gray-800 rounded-xl p-6 flex items-center gap-4 shadow transition-transform duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer group"
          onClick={() => navigate('/tasks?filter=recent-completed')}
        >
          <FaCheckCircle className="text-green-400 text-3xl group-hover:animate-bounce" />
          <div>
            <div className="text-lg font-semibold text-white">{recentlyViewed.filter(t => t.status === 'Done').length}</div>
            <div className="text-gray-400 text-sm">Recently completed</div>
          </div>
        </div>
        {boards.length === 0 && (
          <div className="col-span-full text-gray-400 text-center">No boards found. Click the + icon in the sidebar to create one!</div>
        )}
        {boards.map((board, idx) => (
          <div
            key={board._id || idx}
            className="bg-gray-800 rounded-xl p-6 flex items-center gap-4 shadow transition-transform duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer group"
            onClick={() => navigate(`/board/${board._id}`)}
          >
            <FaClipboardList className="text-blue-400 text-3xl group-hover:animate-bounce" />
            <div>
              <div className="text-lg font-semibold text-white">{board.title}</div>
              <div className="text-gray-400 text-sm">Active board</div>
            </div>
          </div>
        ))}
        <div
          onClick={() => alert('Activity summary chart coming soon!')}
          className="bg-gray-800 rounded-xl p-6 flex flex-col items-center gap-4 shadow transition-transform duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer group"
        >
          <FaChartLine className="text-purple-400 text-3xl group-hover:animate-bounce" />
          <div className="flex flex-col items-start w-full">
            <div className="text-lg font-semibold text-white">+18%</div>
            <div className="text-gray-400 text-sm mb-2">Activity summary</div>
            {/* Sparkline Chart */}
            <div className="w-full h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip
                    contentStyle={{ background: '#22223b', border: 'none', color: '#fff', fontSize: 12 }}
                    labelStyle={{ color: '#fff' }}
                    cursor={{ stroke: '#a78bfa', strokeWidth: 2, opacity: 0.2 }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      {/* Recently Viewed Section */}
      <div className="mt-2">
        <div className="text-lg font-semibold text-white mb-2">📝 Recently Viewed</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {recentlyViewed.length === 0 && (
            <div className="col-span-full text-gray-400 text-center">No recently viewed tasks.</div>
          )}
          {recentlyViewed.map((task, idx) => (
            <div
              key={task._id || idx}
              className="bg-gray-800 rounded-lg p-4 flex flex-col gap-2 shadow hover:shadow-xl hover:bg-gray-700 transition-all duration-200 cursor-pointer"
              onClick={() => navigate(`/board/${task.board}/task/${task._id}`)}
            >
              <div className="font-medium text-white truncate">{task.title}</div>
              <div className="text-xs text-gray-400 truncate">Board: {task.board}</div>
              <span className={`inline-block px-2 py-1 text-xs rounded ${statusColor(task.status)} text-white w-fit`}>{task.status}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Floating Create Task Button */}
      <button
        className="fixed bottom-8 right-8 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl p-5 flex items-center justify-center focus:outline-none transition-all duration-200 text-3xl"
        onClick={() => setShowModal(true)}
        aria-label="Create Task"
      >
        <FaPlus />
      </button>
      {/* Modal Placeholder */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl w-full max-w-md flex flex-col items-center">
            <h3 className="text-xl font-bold text-white mb-4">Create Task (Coming Soon)</h3>
            <button
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 