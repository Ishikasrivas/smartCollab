import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Kanban from './pages/Kanban'
import { Toaster, toast } from 'react-hot-toast'
import UserMenu from './components/UserMenu'
import BackButton from './components/BackButton'
import { useEffect } from 'react'
import { socket } from './socket'

function App() {
  useEffect(() => {
    // Join user room for notifications
    const userId = localStorage.getItem('userId')
    if (userId) {
      socket.emit('joinUserRoom', userId)
    }
    // Listen for notifications
    socket.on('notification', (notif) => {
      toast(notif.message || 'You have a new notification!')
    })
    return () => {
      socket.off('notification')
    }
  }, [])

  return (
    <>
      <Toaster position="top-right" />
      {localStorage.getItem('token') && <UserMenu />}
      <BackButton />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/board/:id" element={<Kanban />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App
