import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './lib/auth'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Validate from './pages/Validate'
import Report from './pages/Report'
import ReportSection from './pages/ReportSection'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminAuth from './pages/AdminAuth'
import DashLayout from './components/dash/DashLayout'
import DashHome from './pages/dash/DashHome'
import Community from './pages/dash/Community'
import Documents from './pages/dash/Documents'
import Schemes from './pages/dash/Schemes'
import Contact from './pages/dash/Contact'
import Portfolio from './pages/dash/Portfolio'
import Leaderboard from './pages/dash/Leaderboard'
import Evaluation from './pages/dash/Evaluation'
import Settings from './pages/dash/Settings'
import Help from './pages/dash/Help'
import MentorDashboard from './pages/MentorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Apply from './pages/Apply'
import Showcase from './pages/Showcase'
import Events from './pages/Events'
import Resources from './pages/Resources'
import Opportunities from './pages/Opportunities'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/validate" element={<ProtectedRoute><Validate /></ProtectedRoute>} />
          <Route path="/report" element={<Report />} />
          <Route path="/report/:section" element={<ReportSection />} />

          <Route path="/apply" element={<Apply />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/events" element={<Events />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/opportunities" element={<Opportunities />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminAuth />} />

          <Route path="/student" element={<ProtectedRoute role="student"><DashLayout /></ProtectedRoute>}>
            <Route index element={<DashHome />} />
            <Route path="community" element={<Community />} />
            <Route path="documents" element={<Documents />} />
            <Route path="schemes" element={<Schemes />} />
            <Route path="contact" element={<Contact />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="evaluation" element={<Evaluation />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Route>
          <Route path="/mentor" element={<ProtectedRoute role="mentor"><MentorDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
