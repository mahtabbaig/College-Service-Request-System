import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerRequest } from '../../services/api'
import { useAuth, homeRouteForRole } from '../../context/AuthContext'

export default function Register() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await registerRequest(form)
      localStorage.setItem('csr_token', res.data.access_token)
      localStorage.setItem('csr_user', JSON.stringify(res.data.user))
      setUser(res.data.user)
      navigate(homeRouteForRole(res.data.user.role))
    } catch (err) {
      setError(err?.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="card w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold text-white">Create your account</h2>
        {error && <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{error}</div>}
        <div>
          <label className="label">Full Name</label>
          <input className="input" value={form.name} onChange={update('name')} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={update('email')} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={form.password} onChange={update('password')} required minLength={6} />
        </div>
        <div>
          <label className="label">I am a</label>
          <select className="input" value={form.role} onChange={update('role')}>
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
          </select>
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        <p className="text-sm text-white/40 text-center">
          Already registered? <Link to="/login" className="text-accent-300">Log in</Link>
        </p>
      </form>
    </div>
  )
}
