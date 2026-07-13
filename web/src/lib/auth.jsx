import { createContext, useContext, useState } from 'react'

const SESSION = 'sivpAuth'
const USERS = 'sivpUsers'

function seedUsers() {
  const seed = [
    { id: 'm1', name: 'Dr. Anita Rao', email: 'mentor@sivp.dev', password: 'mentor123', role: 'mentor', expertise: 'SaaS · GTM · Fundraising' },
    { id: 'a1', name: 'Admin', email: 'admin@sivp.dev', password: 'admin123', role: 'admin' },
    { id: 's1', name: 'Rahul Sharma', email: 'student@sivp.dev', password: 'student123', role: 'student', mentorId: 'm1', startup: 'PawPair' },
  ]
  localStorage.setItem(USERS, JSON.stringify(seed))
  return seed
}

export function loadUsers() {
  const raw = localStorage.getItem(USERS)
  return raw ? JSON.parse(raw) : seedUsers()
}
function saveUsers(u) {
  localStorage.setItem(USERS, JSON.stringify(u))
}
const strip = (u) => {
  const { password, ...safe } = u
  return safe
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const r = localStorage.getItem(SESSION)
    return r ? JSON.parse(r) : null
  })

  function persist(u) {
    setUser(u)
    if (u) localStorage.setItem(SESSION, JSON.stringify(u))
    else localStorage.removeItem(SESSION)
  }

  function signup({ name, email, password, role, startup }) {
    const users = loadUsers()
    if (users.find((u) => u.email === email)) throw new Error('That email is already registered.')
    const newUser = { id: role[0] + Date.now(), name, email, password, role }
    if (role === 'student') {
      newUser.startup = startup || ''
      const mentor = users.find((u) => u.role === 'mentor')
      if (mentor) newUser.mentorId = mentor.id
    }
    if (role === 'mentor') newUser.expertise = 'General'
    users.push(newUser)
    saveUsers(users)
    persist(strip(newUser))
    return strip(newUser)
  }

  function login({ email, password, role }) {
    const users = loadUsers()
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) throw new Error('Invalid email or password.')
    if (role && found.role !== role) throw new Error(`This is a ${found.role} account — use the ${found.role} login.`)
    persist(strip(found))
    return strip(found)
  }

  function loginWithGoogle(role = 'student') {
    const users = loadUsers()
    const email = `google.${role}@sivp.dev`
    let found = users.find((u) => u.email === email)
    if (!found) {
      found = { id: role[0] + Date.now(), name: `Google ${role[0].toUpperCase() + role.slice(1)}`, email, password: '', role }
      if (role === 'student') {
        const mentor = users.find((u) => u.role === 'mentor')
        if (mentor) found.mentorId = mentor.id
      }
      users.push(found)
      saveUsers(users)
    }
    persist(strip(found))
    return strip(found)
  }

  function logout() {
    persist(null)
  }

  return (
    <AuthContext.Provider value={{ user, signup, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
