import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

/** Guards a route by auth + role. `role` can be a string or array of allowed roles. */
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="eyebrow text-[var(--muted)]">// loading…</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />

  if (role) {
    const allowed = Array.isArray(role) ? role : [role]
    if (!allowed.includes(user.role)) {
      const home = { student: '/student', mentor: '/mentor', admin: '/admin/dashboard' }[user.role] || '/'
      return <Navigate to={home} replace />
    }
  }
  return children
}
