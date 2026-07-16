import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Plus, X, ExternalLink } from 'lucide-react'
import { getResources, addResource, deleteResource } from '../../lib/store'

export default function ResourceList({ studentId, canAdd }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', url: '', note: '' })

  const refresh = useCallback(async () => {
    setItems(await getResources(studentId))
  }, [studentId])

  useEffect(() => { refresh() }, [refresh])

  async function add(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    await addResource({ studentId, ...form })
    setForm({ title: '', url: '', note: '' })
    refresh()
  }

  return (
    <div>
      <div className="eyebrow mb-2 flex items-center gap-2"><BookOpen size={14} /> resources</div>
      <div className="mb-2 space-y-1.5">
        {items.length === 0 && <p className="text-xs text-[var(--muted)]">No resources shared yet.</p>}
        {items.map((r) => (
          <div key={r.id} className="brutal-flat flex items-start gap-2 p-2 text-xs">
            <div className="flex-1">
              {r.url ? (
                <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-[var(--blue)]">
                  {r.title} <ExternalLink size={11} />
                </a>
              ) : (
                <span className="font-bold">{r.title}</span>
              )}
              {r.note && <div className="text-[var(--ink-soft)]">{r.note}</div>}
            </div>
            {canAdd && (
              <button onClick={async () => { await deleteResource(r.id); refresh() }} className="text-[var(--muted)] hover:text-[var(--ink)]" aria-label="Delete"><X size={12} /></button>
            )}
          </div>
        ))}
      </div>
      {canAdd && (
        <form onSubmit={add} className="space-y-1.5">
          <input className="w-full brutal-flat bg-white px-2 py-1.5 text-sm outline-none" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Resource title" />
          <input className="w-full brutal-flat bg-white px-2 py-1.5 text-sm outline-none" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="URL (optional)" />
          <div className="flex gap-2">
            <input className="flex-1 brutal-flat bg-white px-2 py-1.5 text-sm outline-none" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Note (optional)" />
            <button className="btn btn-light btn-sm" type="submit" aria-label="Add"><Plus size={13} /></button>
          </div>
        </form>
      )}
    </div>
  )
}
