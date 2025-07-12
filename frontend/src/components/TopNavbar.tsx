import { FaBuilding, FaSearch, FaUserCircle, FaCog, FaSignOutAlt, FaUser, FaBars } from 'react-icons/fa'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TopNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'User';
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    navigate('/login');
  };
  return (
    <nav className="w-full h-16 bg-gray-900 flex items-center px-4 sm:px-8 shadow z-30 sticky top-0">
      {/* Hamburger for mobile */}
      <button
        className="sm:hidden mr-3 text-white text-2xl focus:outline-none"
        onClick={onMenuClick}
        aria-label="Open sidebar menu"
      >
        <FaBars />
      </button>
      {/* Left: Logo + Workspace Name */}
      <div className="flex items-center gap-2 text-white font-bold text-lg min-w-[180px]">
        <FaBuilding className="text-blue-400 text-2xl" />
        <span>Acme Workspace</span>
      </div>
      {/* Center: Search Bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search tasks, users, boards..."
            className="w-full rounded-md bg-gray-800 text-white pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      {/* Right: User Avatar Dropdown */}
      <div className="relative ml-4">
        <button
          className="flex items-center gap-2 text-white focus:outline-none rounded-full hover:bg-gray-800 px-2 py-1"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <div className="w-9 h-9 bg-blue-600 flex items-center justify-center rounded-full text-lg font-bold">
            <FaUser className="text-white" />
          </div>
          <span className="hidden sm:inline font-semibold">{name}</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-gray-800 rounded-xl shadow-lg py-2 z-30 animate-fade-in">
            <button className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-t-xl">
              <FaUserCircle className="mr-2" /> Profile
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-700">
              <FaCog className="mr-2" /> Settings
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-xl" onClick={handleLogout}>
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
} 