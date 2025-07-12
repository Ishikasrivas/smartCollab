import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ThreeBackground from '../components/ThreeBackground'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')
      localStorage.setItem('token', data.token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-2 sm:p-4 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ThreeBackground />
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-black/80 rounded-2xl shadow-2xl p-4 sm:p-8 flex flex-col items-center z-10 mx-2"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white text-center w-full">Register</h2>
        <form className="space-y-4 w-full" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300">Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-gray-900 text-white border border-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Your Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md bg-gray-900 text-white border border-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md bg-gray-900 text-white border border-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold shadow-lg transition-all duration-200"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400 w-full">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-400 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}