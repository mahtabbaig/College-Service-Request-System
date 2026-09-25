import React, { useEffect, useState } from 'react'
import { Trash2, UserPlus } from 'lucide-react'
import AppLayout from '../../layouts/AppLayout'
import { listUsers, createUser, deleteUser } from '../../services/api'

const ROLES = ['STUDENT', 'FACULTY', 'SERVICE_STAFF', 'SERVICE_LEAD', 'ADMIN']

export default function Users() {
  const [users, setUsers] = useState([])
  const [roleFilter, setRoleFilter] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SERVICE_STAFF', department: '' })
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const load = () => listUsers({ role: roleFilter || undefined }).then((r) => setUsers(r.data))
  useEffect(() => { load() }, [roleFilter])

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createUser(form)
      setForm({ name: '', email: '', password: '', role: 'SERVICE_STAFF', department: '' })
      setShowForm(false)
      load()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to create user')
    }
  }

  const remove = async (id) => {
    if (!confirm('Remove this user?')) return
    await deleteUser(id)
    load()
  }

  return (
    <AppLayout title="Manage Users" subtitle={`${users.length} users`}>
      <div className="flex items-center justify-between mb-6">
        <select className="input w-56" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
        </select>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm((s) => !s)}>
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card mb-6 grid grid-cols-2 gap-4">
          {error && <div className="col-span-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{error}</div>}
          <div><label className="label">Name</label><input className="input" value={form.name} onChange={update('name')} required /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={update('email')} required /></div>
          <div><label className="label">Password</label><input className="input" type="password" value={form.password} onChange={update('password')} required minLength={6} /></div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={update('role')}>
              {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="col-span-2"><label className="label">Department (optional)</label><input className="input" value={form.department} onChange={update('department')} /></div>
          <button className="btn-primary col-span-2">Create User</button>
        </form>
      )}

      <div className="card !p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 border-b border-white/5">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                <td className="px-5 py-3 text-white/90">{u.name}</td>
                <td className="px-5 py-3 text-white/60">{u.email}</td>
                <td className="px-5 py-3 text-white/60">{u.role.replace('_', ' ')}</td>
                <td className="px-5 py-3 text-white/60">{u.department || '—'}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => remove(u.id)} className="text-white/30 hover:text-rose-300"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  )
}
