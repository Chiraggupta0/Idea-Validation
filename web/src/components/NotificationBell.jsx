import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { getNotifications, timeAgo, getLastSeen, setLastSeen } from '../lib/notifications'

export default function NotificationBell() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState([])
  const [lastSeen, setSeen] = useState(0)

  useEffect(() => {
    if (!user) return
    setSeen(getLastSeen(user.id))
    getNotifications(user).then(setNotes)
  }, [user])

  if (!user) return null

  const unread = notes.filter((x) => x.at > lastSeen).length

  function toggle() {
    const willOpen = !open
    setOpen(willOpen)
    if (willOpen) {
      setLastSeen(user.id)
      setSeen(Date.now())
    }
  }
  function go(link) {
    setOpen(false)
    nav(link)
  }

  return (
    <div className="relative">
      <button onClick={toggle} className="glass relative flex h-9 w-9 items-center justify-center rounded-lg" aria-label="Notifications">
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: 'var(--blue)' }}>
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="glass absolute right-0 z-50 mt-2 max-h-80 w-72 overflow-y-auto rounded-xl p-2">
          <div className="eyebrow px-2 py-1">// notifications</div>
          {notes.length === 0 && <p className="px-2 py-3 text-xs text-[var(--muted)]">Nothing yet.</p>}
          {notes.map((x) => (
            <button key={x.id} onClick={() => go(x.link)} className="brutal-flat mb-1 block w-full p-2 text-left text-xs hover:bg-white/60">
              {x.text}
              <div className="text-[10px] text-[var(--muted)]">{timeAgo(x.at)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
