import { useState, useEffect, useCallback } from 'react'
import { ListChecks, Plus, X } from 'lucide-react'
import { getTasks, addTask, toggleTask, deleteTask } from '../../lib/store'

export default function TaskList({ studentId, mentorId, canAssign }) {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')

  const refresh = useCallback(async () => {
    setTasks(await getTasks(studentId))
  }, [studentId])

  useEffect(() => { refresh() }, [refresh])

  async function add(e) {
    e.preventDefault()
    if (!title.trim()) return
    await addTask({ studentId, mentorId, title: title.trim() })
    setTitle('')
    refresh()
  }

  const done = tasks.filter((t) => t.done).length

  return (
    <div>
      <div className="eyebrow mb-2 flex items-center gap-2">
        <ListChecks size={14} /> action items {tasks.length > 0 && <span className="text-[var(--muted)]">({done}/{tasks.length})</span>}
      </div>
      <div className="mb-2 space-y-1">
        {tasks.length === 0 && <p className="text-xs text-[var(--muted)]">No action items yet.</p>}
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={t.done} onChange={async () => { await toggleTask(t.id, !t.done); refresh() }} />
            <span className={t.done ? 'text-[var(--muted)] line-through' : ''}>{t.title}</span>
            {canAssign && (
              <button onClick={async () => { await deleteTask(t.id); refresh() }} className="ml-auto text-[var(--muted)] hover:text-[var(--ink)]" aria-label="Delete"><X size={13} /></button>
            )}
          </div>
        ))}
      </div>
      {canAssign && (
        <form onSubmit={add} className="flex gap-2">
          <input
            className="flex-1 brutal-flat bg-white px-2 py-1.5 text-sm outline-none focus:shadow-[3px_3px_0_var(--blue)]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Assign a task…"
          />
          <button className="btn btn-light btn-sm" type="submit" aria-label="Add"><Plus size={13} /></button>
        </form>
      )}
    </div>
  )
}
