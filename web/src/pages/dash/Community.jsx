import { useState, useEffect, useRef, useCallback } from 'react'
import { Send } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { getCommunityMessages, sendCommunityMessage, subscribeCommunity } from '../../lib/store'
import PageHead from '../../components/dash/PageHead'

const roleColor = { mentor: '#EAF0FF', admin: '#FFF3D6', student: '#fff' }

export default function Community() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const endRef = useRef(null)

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }, [])

  useEffect(() => {
    let active = true
    getCommunityMessages().then((m) => {
      if (!active) return
      setMessages(m)
      scrollDown()
    })
    const channel = subscribeCommunity((msg) => {
      setMessages((prev) => (prev.some((p) => p.id === msg.id) ? prev : [...prev, msg]))
      scrollDown()
    })
    return () => {
      active = false
      channel.unsubscribe()
    }
  }, [scrollDown])

  async function send(e) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setText('')
    await sendCommunityMessage({ senderId: user.id, name: user.name, role: user.role, text: t })
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <PageHead eyebrow="community" title="Community chat">
        Open chat for everyone in the incubation centre.
      </PageHead>

      <div className="brutal flex min-h-0 flex-1 flex-col p-4">
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {messages.length === 0 && <p className="text-sm text-[var(--muted)]">No messages yet — say hello 👋</p>}
          {messages.map((m) => {
            const mine = m.sender_id === user.id
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className="brutal-flat max-w-[75%] p-2.5 text-sm" style={{ background: mine ? 'var(--blue)' : roleColor[m.role] || '#fff', color: mine ? '#fff' : 'inherit' }}>
                  {!mine && (
                    <div className="mb-0.5 text-xs font-bold">
                      {(m.name || 'user').split(' ')[0]}
                      {m.role && m.role !== 'student' && <span className="ml-1 uppercase text-[10px] opacity-70">· {m.role}</span>}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                  <div className={`mt-0.5 text-[10px] ${mine ? 'text-white/60' : 'text-[var(--muted)]'}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="mt-3 flex gap-2">
          <input
            className="flex-1 brutal-flat bg-white px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_var(--blue)]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message the community…"
          />
          <button className="btn btn-light btn-sm" type="submit" aria-label="Send"><Send size={14} /></button>
        </form>
      </div>
    </div>
  )
}
