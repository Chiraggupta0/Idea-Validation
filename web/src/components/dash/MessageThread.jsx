import { useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { getThread, sendMessage } from '../../lib/store'

export default function MessageThread({ studentId, role, senderName }) {
  const [thread, setThread] = useState(() => getThread(studentId))
  const [text, setText] = useState('')

  function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    sendMessage({ studentId, from: role, name: senderName, text: text.trim() })
    setThread(getThread(studentId))
    setText('')
  }

  return (
    <div>
      <div className="eyebrow mb-2 flex items-center gap-2"><MessageCircle size={14} /> messages</div>
      <div className="mb-2 max-h-44 space-y-1 overflow-y-auto">
        {thread.length === 0 && <p className="text-xs text-[var(--muted)]">No messages yet.</p>}
        {thread.map((m) => (
          <div
            key={m.id}
            className={`brutal-flat p-2 text-xs ${m.from === role ? 'ml-6' : 'mr-6'}`}
            style={{ background: m.from === 'mentor' ? '#EAF0FF' : '#fff' }}
          >
            <b>{(m.name || m.from).split(' ')[0]}:</b> {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input
          className="flex-1 brutal-flat bg-white px-2 py-1.5 text-sm outline-none focus:shadow-[3px_3px_0_var(--blue)]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
        />
        <button className="btn btn-light btn-sm" type="submit" aria-label="Send"><Send size={13} /></button>
      </form>
    </div>
  )
}
