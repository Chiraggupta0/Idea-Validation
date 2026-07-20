import { useState, useEffect } from 'react'
import { SAMPLE_REPORT } from './sampleReport'

/**
 * Reads the report the backend stored in sessionStorage (already normalized to
 * the frontend shape by Validate.jsx). Falls back to the sample report so the
 * page still renders if opened directly. Does NOT clear storage — detail pages
 * read the same report.
 */
export function useReport() {
  const [report, setReport] = useState(SAMPLE_REPORT)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('sivpReport')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.__live) {
          setReport(parsed)
          setIsLive(true)
        }
      } catch (e) {
        console.error('Bad stored report:', e)
      }
    }
  }, [])

  return { report, isLive }
}
