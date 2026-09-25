import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Repeat } from 'lucide-react'
import { useAuth, homeRouteForRole } from '../../context/AuthContext'

const DEMO_ACCOUNTS = [
  { role: 'Student', email: 'student@college.demo' },
  { role: 'Faculty', email: 'faculty@college.demo' },
  { role: 'Service Staff', email: 'staff@college.demo' },
  { role: 'Service Lead', email: 'lead@college.demo' },
  { role: 'Admin', email: 'admin@college.demo' },
]
const DEMO_PASSWORD = 'Demo@1234'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const doLogin = async (e, overrideEmail, overridePassword, overrideRole)  => {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(
  overrideEmail || email,
  overridePassword || password,
  overrideRole || role
)
      navigate(homeRouteForRole(user.role))
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-accent-500/20 border border-accent-500/40 flex items-center justify-center shadow-glow">
            <Repeat className="w-5 h-5 text-accent-300" />
          </div>
          <span className="font-semibold text-white">Nexus Institute · Service Desk</span>
        </div>

        <form onSubmit={doLogin} className="card space-y-4">
          <h2 className="text-lg font-semibold text-white">Log in</h2>
          {error && <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
  <label className="label">Role</label>
  <select
    className="input"
    value={role}
    onChange={(e) => setRole(e.target.value)}
    required
  >
    <option value="STUDENT">STUDENT</option>
    <option value="FACULTY">FACULTY</option>
    <option value="SERVICE_STAFF">SERVICE STAFF</option>
    <option value="SERVICE_LEAD">SERVICE LEAD</option>
  
  </select>
</div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
          <p className="text-sm text-white/40 text-center">
            No account? <Link to="/register" className="text-accent-300">Register</Link>
          </p>
        </form>

        
      </div>
    </div>
  )
}
