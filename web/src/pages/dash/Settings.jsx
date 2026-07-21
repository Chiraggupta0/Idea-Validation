import { useState, useRef } from 'react'
import { User, Lock, Camera } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { uploadAvatar, changePassword } from '../../lib/store'
import PageHead from '../../components/dash/PageHead'
import SkeuoButton from '../../components/SkeuoButton'

const inputCls = 'w-full brutal-flat bg-white px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_var(--blue)]'

function Note({ msg }) {
  if (!msg) return null
  const ok = msg.type === 'ok'
  return <p className={`mt-2 text-xs font-bold ${ok ? 'text-[var(--blue)]' : 'text-[#c0392b]'}`}>{msg.text}</p>
}

export default function Settings() {
  const { user, updateProfile } = useAuth()
  const [profile, setProfile] = useState({ name: user.name || '', phone: user.phone || '', startup: user.startup || '' })
  const [pw, setPw] = useState({ next: '', confirm: '' })
  const [profileMsg, setProfileMsg] = useState(null)
  const [pwMsg, setPwMsg] = useState(null)
  const [avatarMsg, setAvatarMsg] = useState(null)
  const fileRef = useRef(null)

  const initials = (user.name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  async function saveProfile(e) {
    e.preventDefault()
    try {
      await updateProfile({ name: profile.name, phone: profile.phone, startup: profile.startup })
      setProfileMsg({ type: 'ok', text: 'Profile saved.' })
    } catch (err) {
      setProfileMsg({ type: 'err', text: err.message })
    }
  }

  async function onAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarMsg({ type: 'ok', text: 'Uploading…' })
    try {
      const url = await uploadAvatar(user.id, file)
      await updateProfile({ avatar_url: url })
      setAvatarMsg({ type: 'ok', text: 'Photo updated.' })
    } catch (err) {
      setAvatarMsg({ type: 'err', text: err.message })
    }
  }

  async function savePassword(e) {
    e.preventDefault()
    if (pw.next.length < 6) { setPwMsg({ type: 'err', text: 'Password must be at least 6 characters.' }); return }
    if (pw.next !== pw.confirm) { setPwMsg({ type: 'err', text: 'Passwords do not match.' }); return }
    try {
      await changePassword(pw.next)
      setPw({ next: '', confirm: '' })
      setPwMsg({ type: 'ok', text: 'Password changed.' })
    } catch (err) {
      setPwMsg({ type: 'err', text: err.message })
    }
  }

  return (
    <div>
      <PageHead eyebrow="settings" title="Settings">
        Update your profile, photo, and password.
      </PageHead>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Photo */}
        <div className="brutal p-5">
          <div className="eyebrow mb-3 flex items-center gap-2"><Camera size={14} /> profile photo</div>
          <div className="flex items-center gap-4">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--blue)] text-lg font-bold text-white">{initials}</div>
            )}
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatar} />
              <SkeuoButton size="sm" onClick={() => fileRef.current?.click()}>Change photo</SkeuoButton>
              <Note msg={avatarMsg} />
            </div>
          </div>
        </div>

        {/* Profile */}
        <form onSubmit={saveProfile} className="brutal p-5">
          <div className="eyebrow mb-3 flex items-center gap-2"><User size={14} /> profile</div>
          <label className="eyebrow mb-1 block text-[var(--muted)]">Name</label>
          <input className={inputCls} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <label className="eyebrow mb-1 mt-3 block text-[var(--muted)]">Phone</label>
          <input className={inputCls} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91…" />
          <label className="eyebrow mb-1 mt-3 block text-[var(--muted)]">Startup name</label>
          <input className={inputCls} value={profile.startup} onChange={(e) => setProfile({ ...profile, startup: e.target.value })} />
          <SkeuoButton type="submit" size="sm" className="mt-4">Save profile</SkeuoButton>
          <Note msg={profileMsg} />
        </form>

        {/* Password */}
        <form onSubmit={savePassword} className="brutal p-5">
          <div className="eyebrow mb-3 flex items-center gap-2"><Lock size={14} /> change password</div>
          <label className="eyebrow mb-1 block text-[var(--muted)]">New password</label>
          <input className={inputCls} type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
          <label className="eyebrow mb-1 mt-3 block text-[var(--muted)]">Confirm new password</label>
          <input className={inputCls} type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
          <SkeuoButton type="submit" size="sm" className="mt-4">Update password</SkeuoButton>
          <Note msg={pwMsg} />
        </form>
      </div>
    </div>
  )
}
