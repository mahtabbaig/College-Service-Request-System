import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import { getServiceCategories, createServiceRequest, previewImpact } from '../../services/api'
import { PriorityPill } from '../../components/StatusPill'

export default function NewRequest() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [urgency, setUrgency] = useState('NORMAL')
  const [peopleAffected, setPeopleAffected] = useState(1)
  const [formData, setFormData] = useState({})
  const [impact, setImpact] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getServiceCategories().then((r) => setCategories(r.data))
  }, [])

  const selected = categories.find((c) => c.value === category)

  useEffect(() => {
    if (!category) { setImpact(null); return }
    previewImpact({ category, people_affected: peopleAffected, urgency }).then((r) => setImpact(r.data)).catch(() => {})
  }, [category, peopleAffected, urgency])

  const updateField = (key) => (e) => setFormData((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!category) { setError('Please choose a service category'); return }
    setSubmitting(true)
    try {
      const res = await createServiceRequest({
        service_category: category,
        title,
        description,
        location,
        urgency,
        people_affected: Number(peopleAffected) || 1,
        form_data: formData,
      })
      navigate(`/requests/${res.data.id}`)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to create request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout title="New Service Request" subtitle="Fill in the details below — required fields depend on the service you choose">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={submit} className="lg:col-span-2 card space-y-5">
          {error && <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{error}</div>}

          <div>
            <label className="label">Service Category</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => { setCategory(c.value); setFormData({}) }}
                  className={`px-3 py-2.5 rounded-lg text-sm text-left border transition-colors ${
                    category === c.value
                      ? 'bg-accent-500/15 border-accent-500/40 text-accent-300'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[90px]" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Location</label>
              <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Hostel Block B" required />
            </div>
            <div>
              <label className="label">Urgency</label>
              <select className="input" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">People Affected (estimate)</label>
            <input className="input" type="number" min={1} value={peopleAffected} onChange={(e) => setPeopleAffected(e.target.value)} />
          </div>

          {selected && (
            <div className="border-t border-white/10 pt-5 space-y-4">
              <h3 className="text-sm font-medium text-white/70">{selected.label} details</h3>
              {selected.fields.map((f) => (
                <div key={f.key}>
                  <label className="label">{f.label}{f.required && ' *'}</label>
                  {f.type === 'select' ? (
                    <select className="input" required={f.required} value={formData[f.key] || ''} onChange={updateField(f.key)}>
                      <option value="">Select...</option>
                      {f.options.map((o) => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                    </select>
                  ) : (
                    <input
                      className="input"
                      type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                      required={f.required}
                      value={formData[f.key] || ''}
                      onChange={updateField(f.key)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <button className="btn-primary w-full" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
        </form>

        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-medium text-white/70 mb-3">Impact & Priority Preview</h3>
            {!impact && <p className="text-sm text-white/40">Choose a category to see a live score.</p>}
            {impact && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-semibold text-white">{impact.score}<span className="text-sm text-white/40">/100</span></span>
                  <PriorityPill priority={impact.priority} />
                </div>
                <div className="space-y-2">
                  {impact.factors.map((f) => (
                    <div key={f.name} className="text-xs">
                      <div className="flex justify-between text-white/60">
                        <span>{f.name}</span><span>+{f.points}</span>
                      </div>
                      <div className="text-white/35">{f.reason}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-white/30 mt-3 border-t border-white/10 pt-3">
                  Rule-based scoring — no AI/ML. See explanation on the request detail page.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
