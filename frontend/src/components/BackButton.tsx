import { useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

export default function BackButton() {
  const navigate = useNavigate()
  const location = useLocation()

  // Hide on dashboard
  if (location.pathname === '/dashboard') return null

  return (
    <button
      className="fixed top-4 left-4 z-50 bg-gray-800 text-white rounded-full p-2 shadow-lg hover:bg-gray-700 focus:outline-none"
      onClick={() => navigate(-1)}
      title="Back"
    >
      <FaArrowLeft size={20} />
    </button>
  )
} 