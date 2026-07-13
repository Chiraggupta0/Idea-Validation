import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import Validate from './pages/Validate'
import Report from './pages/Report'
import ReportSection from './pages/ReportSection'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/validate" element={<Validate />} />
        <Route path="/report" element={<Report />} />
        <Route path="/report/:section" element={<ReportSection />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
