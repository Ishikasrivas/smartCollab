import { useNavigate } from 'react-router-dom'
import { FaSignOutAlt } from 'react-icons/fa'

export default function UserMenu() {
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <button
      className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg font-semibold"
      onClick={handleLogout}
      title="Logout"
    >
      <FaSignOutAlt size={18} /> Logout
    </button>
  )
} 